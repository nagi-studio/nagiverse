/**
 * Shared content loader for build scripts.
 * Reads all user profiles and notes from /content.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import yaml from 'js-yaml';
import matter from 'gray-matter';
import type { UserProfile, NoteFrontmatter, NoteDocument } from '../src/lib/types/index.js';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'users');

export const STATIC_DIR = join(ROOT, 'static', 'generated');
export const LIB_GENERATED_DIR = join(ROOT, 'src', 'lib', 'generated');

/**
 * Wiki link syntax:
 *   [[note-id]]          → link to a note
 *   [[note-id|显示文本]]  → link to a note with custom display text
 *   [[@user-id]]         → mention a user
 *
 * Returns deduplicated list of raw targets (including @ prefix for users).
 */
export function extractWikiLinks(body: string): string[] {
	const re = /\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g;
	const links: string[] = [];
	let m: RegExpExecArray | null;
	while ((m = re.exec(body)) !== null) {
		links.push(m[1].trim());
	}
	return [...new Set(links)];
}

/**
 * Convert wiki link syntax to standard markdown links before remark processing.
 *   [[note-id]]         → [note-id](/notes/note-id)
 *   [[note-id|text]]    → [text](/notes/note-id)
 *   [[@user-id]]        → [user-id](/users/user-id)
 *   [[@user-id|text]]   → [text](/users/user-id)
 */
export function resolveWikiLinks(body: string): string {
	return body.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target: string, label?: string) => {
		target = target.trim();
		if (target.startsWith('@')) {
			const userId = target.slice(1);
			return `[${label?.trim() || userId}](/users/${userId})`;
		}
		return `[${label?.trim() || target}](/notes/${target})`;
	});
}

export interface LoadedUser {
	profile: UserProfile;
	dirName: string;
}

export interface LoadedNote {
	doc: NoteDocument;
}

export function loadAllUsers(): LoadedUser[] {
	if (!existsSync(CONTENT_DIR)) return [];
	const dirs = readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
	const users: LoadedUser[] = [];

	for (const dir of dirs) {
		const profilePath = join(CONTENT_DIR, dir.name, 'profile.yaml');
		if (!existsSync(profilePath)) continue;
		const raw = readFileSync(profilePath, 'utf-8');
		const profile = yaml.load(raw) as UserProfile;
		users.push({ profile, dirName: dir.name });
	}

	return users;
}

export function loadAllNotes(): LoadedNote[] {
	if (!existsSync(CONTENT_DIR)) return [];
	const dirs = readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
	const notes: LoadedNote[] = [];

	for (const dir of dirs) {
		const notesDir = join(CONTENT_DIR, dir.name, 'notes');
		if (!existsSync(notesDir)) continue;
		const files = readdirSync(notesDir).filter((f) => f.endsWith('.md'));

		for (const file of files) {
			const raw = readFileSync(join(notesDir, file), 'utf-8');
			const { data, content } = matter(raw);
			const frontmatter = data as NoteFrontmatter;
			const wikiLinks = extractWikiLinks(content);

			notes.push({
				doc: {
					frontmatter,
					owner: dir.name,
					body: content,
					html: '', // filled during build-graph / build-search-index
					wikiLinks
				}
			});
		}
	}

	return notes;
}
