/**
 * Build search index and manifest.
 * Outputs:
 *   static/generated/search-index.json
 *   static/generated/manifest.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import MiniSearch from 'minisearch';
import { loadAllUsers, loadAllNotes, STATIC_DIR } from './load-content.js';
import type { SearchEntry, Manifest } from '../src/lib/types/index.js';

mkdirSync(STATIC_DIR, { recursive: true });

const users = loadAllUsers();
const notes = loadAllNotes();

// ── Build search entries ──
const entries: SearchEntry[] = [];

for (const { profile } of users) {
	entries.push({
		id: `user:${profile.id}`,
		type: 'user',
		title: profile.name,
		summary: profile.bio ?? '',
		tags: profile.tags ?? []
	});
}

for (const { doc } of notes) {
	const fm = doc.frontmatter;
	entries.push({
		id: `note:${fm.id}`,
		type: 'note',
		title: fm.title,
		summary: fm.summary ?? '',
		tags: fm.tags ?? [],
		owner: doc.owner,
		body: doc.body.slice(0, 500)
	});
}

// ── Build MiniSearch index ──
const miniSearch = new MiniSearch<SearchEntry>({
	fields: ['title', 'summary', 'tags', 'body'],
	storeFields: ['id', 'type', 'title', 'summary', 'tags', 'owner'],
	extractField: (doc, fieldName) => {
		if (fieldName === 'tags') return (doc.tags ?? []).join(' ');
		return (doc as Record<string, unknown>)[fieldName] as string;
	}
});

miniSearch.addAll(entries);

writeFileSync(
	STATIC_DIR + '/search-index.json',
	JSON.stringify(miniSearch.toJSON())
);

console.log(`Search index: ${entries.length} entries`);

// ── Manifest ──
const allTags = new Set<string>();
for (const { profile } of users) for (const t of profile.tags ?? []) allTags.add(t);
for (const { doc } of notes) for (const t of doc.frontmatter.tags ?? []) allTags.add(t);

const manifest: Manifest = {
	builtAt: new Date().toISOString(),
	userCount: users.length,
	noteCount: notes.length,
	tagCount: allTags.size,
	users: users.map((u) => u.profile.id),
	tags: [...allTags].sort()
};

writeFileSync(
	STATIC_DIR + '/manifest.json',
	JSON.stringify(manifest, null, 2)
);

console.log('Search index and manifest built.');
