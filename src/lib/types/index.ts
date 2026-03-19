// ── Content Types ──

export interface UserProfile {
	id: string;
	name: string;
	bio?: string;
	avatar?: string;
	links?: Record<string, string>;
	tags?: string[];
}

export interface NoteFrontmatter {
	id: string;
	title: string;
	summary?: string;
	tags?: string[];
	links?: string[];
	related_users?: string[];
	related_notes?: string[];
	source_url?: string;
	created_at?: string;
	updated_at?: string;
}

export interface NoteDocument {
	frontmatter: NoteFrontmatter;
	/** Owner user id (derived from directory path) */
	owner: string;
	/** Raw markdown body */
	body: string;
	/** Pre-rendered HTML */
	html: string;
	/** Wiki links extracted from body: [[target]] */
	wikiLinks: string[];
}

// ── Graph Types ──

export type GraphNodeType = 'user' | 'note' | 'tag' | 'external';

export type GraphEdgeType =
	| 'owns'
	| 'links_to'
	| 'tagged_with'
	| 'relates_to'
	| 'references';

export interface GraphNode {
	id: string;
	type: GraphNodeType;
	label: string;
	x: number;
	y: number;
	size: number;
	color: string;
	/** Extra metadata for UI */
	meta?: Record<string, unknown>;
}

export interface GraphEdge {
	id: string;
	source: string;
	target: string;
	type: GraphEdgeType;
	label?: string;
	color?: string;
	size?: number;
}

export interface GraphData {
	nodes: GraphNode[];
	edges: GraphEdge[];
}

// ── Search Types ──

export interface SearchEntry {
	id: string;
	type: 'user' | 'note';
	title: string;
	summary: string;
	tags: string[];
	owner?: string;
	body?: string;
}

// ── Manifest ──

export interface Manifest {
	builtAt: string;
	userCount: number;
	noteCount: number;
	tagCount: number;
	users: string[];
	tags: string[];
}
