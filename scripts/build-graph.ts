/**
 * Build graph data from content.
 * Outputs:
 *   static/generated/graph.full.json
 *   static/generated/users/{id}.graph.json
 *   static/generated/tags/{tag}.graph.json
 *   src/lib/generated/users.json      (user profiles for SSR)
 *   src/lib/generated/notes.json      (note documents for SSR)
 *
 * No longer depends on graphology — layout is done client-side by d3-force.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import {
	loadAllUsers,
	loadAllNotes,
	resolveWikiLinks,
	STATIC_DIR,
	LIB_GENERATED_DIR
} from './load-content.js';
import type { GraphData, GraphNode, GraphEdge, NoteDocument } from '../src/lib/types/index.js';

// ── Markdown renderer ──
const md = unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(rehypeStringify);

function renderMarkdown(body: string): string {
	// Resolve [[wiki links]] to standard markdown links before remark processing
	const resolved = resolveWikiLinks(body);
	return String(md.processSync(resolved));
}

// ── Main ──
const users = loadAllUsers();
const notes = loadAllNotes();

console.log(`Building graph: ${users.length} users, ${notes.length} notes`);

const allNodes: GraphNode[] = [];
const allEdges: GraphEdge[] = [];
const nodeIds = new Set<string>();

function addNode(node: GraphNode) {
	if (!nodeIds.has(node.id)) {
		nodeIds.add(node.id);
		allNodes.push(node);
	}
}

let edgeId = 0;
function addEdge(source: string, target: string, type: string) {
	if (nodeIds.has(source) && nodeIds.has(target)) {
		allEdges.push({ id: `e${edgeId++}`, source, target, type });
	}
}

// ── User nodes ──
for (const { profile } of users) {
	addNode({
		id: profile.id,
		type: 'user',
		label: profile.name,
		x: 0, y: 0, size: 12,
		color: '#a78bfa',
		meta: { bio: profile.bio }
	});
}

// ── Note nodes ──
const renderedNotes: NoteDocument[] = [];

for (const { doc } of notes) {
	const html = renderMarkdown(doc.body);
	renderedNotes.push({ ...doc, html });

	const fm = doc.frontmatter;
	addNode({
		id: fm.id,
		type: 'note',
		label: fm.title,
		x: 0, y: 0, size: 6,
		color: '#34d399',
		meta: { summary: fm.summary, owner: doc.owner }
	});
}

// ── Tag nodes ──
const allTags = new Set<string>();
for (const { profile } of users) for (const t of profile.tags ?? []) allTags.add(t);
for (const { doc } of notes) for (const t of doc.frontmatter.tags ?? []) allTags.add(t);

for (const tag of allTags) {
	addNode({
		id: `tag:${tag}`,
		type: 'tag',
		label: `#${tag}`,
		x: 0, y: 0, size: 8,
		color: '#fbbf24'
	});
}

// ── Edges ──
for (const doc of renderedNotes) {
	const fm = doc.frontmatter;
	addEdge(doc.owner, fm.id, 'owns');
	for (const t of fm.tags ?? []) addEdge(fm.id, `tag:${t}`, 'tagged_with');
	for (const rid of fm.related_notes ?? []) addEdge(fm.id, rid, 'relates_to');
	for (const uid of fm.related_users ?? []) addEdge(fm.id, uid, 'relates_to');
	for (const wl of doc.wikiLinks) {
		if (wl.startsWith('@')) {
			// [[@user-id]] → links_to user
			const uid = wl.slice(1);
			if (nodeIds.has(uid)) addEdge(fm.id, uid, 'links_to');
		} else if (nodeIds.has(wl)) {
			addEdge(fm.id, wl, 'links_to');
		}
	}
	for (const url of fm.links ?? []) {
		const extId = `ext:${url}`;
		addNode({
			id: extId,
			type: 'external',
			label: new URL(url).hostname,
			x: 0, y: 0, size: 4,
			color: '#63636e',
			meta: { url }
		});
		addEdge(fm.id, extId, 'references');
	}
}

for (const { profile } of users) {
	for (const t of profile.tags ?? []) addEdge(profile.id, `tag:${t}`, 'tagged_with');
}

// ── Subgraph helper ──
function subgraph(seedIds: Set<string>): GraphData {
	// Expand to include neighbors
	const included = new Set<string>();
	for (const id of seedIds) {
		included.add(id);
		for (const e of allEdges) {
			if (e.source === id) included.add(e.target);
			if (e.target === id) included.add(e.source);
		}
	}

	return {
		nodes: allNodes.filter((n) => included.has(n.id)),
		edges: allEdges.filter((e) => included.has(e.source) && included.has(e.target))
	};
}

// ── Write outputs ──
mkdirSync(STATIC_DIR, { recursive: true });
mkdirSync(join(STATIC_DIR, 'users'), { recursive: true });
mkdirSync(join(STATIC_DIR, 'tags'), { recursive: true });
mkdirSync(LIB_GENERATED_DIR, { recursive: true });

const fullData: GraphData = { nodes: allNodes, edges: allEdges };
writeFileSync(join(STATIC_DIR, 'graph.full.json'), JSON.stringify(fullData));
console.log(`  graph.full.json: ${allNodes.length} nodes, ${allEdges.length} edges`);

for (const { profile } of users) {
	const data = subgraph(new Set([profile.id]));
	writeFileSync(join(STATIC_DIR, 'users', `${profile.id}.graph.json`), JSON.stringify(data));
}

for (const tag of allTags) {
	const data = subgraph(new Set([`tag:${tag}`]));
	writeFileSync(join(STATIC_DIR, 'tags', `${tag}.graph.json`), JSON.stringify(data));
}

// SSR data
writeFileSync(join(LIB_GENERATED_DIR, 'users.json'), JSON.stringify(users.map((u) => u.profile), null, 2));
writeFileSync(
	join(LIB_GENERATED_DIR, 'notes.json'),
	JSON.stringify(renderedNotes.map((n) => ({
		frontmatter: n.frontmatter,
		owner: n.owner,
		html: n.html,
		wikiLinks: n.wikiLinks
	})), null, 2)
);

console.log('Graph build complete.');
