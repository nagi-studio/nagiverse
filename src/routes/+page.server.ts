import usersJson from '$lib/generated/users.json';
import notesJson from '$lib/generated/notes.json';
import type { UserProfile, NoteFrontmatter } from '$lib/types/index.js';

export const prerender = true;

interface NoteEntry {
	frontmatter: NoteFrontmatter;
	owner: string;
}

export function load() {
	const users = usersJson as UserProfile[];
	const notes = notesJson as NoteEntry[];

	// Collect all tags
	const tagSet = new Set<string>();
	for (const u of users) for (const t of u.tags ?? []) tagSet.add(t);
	for (const n of notes) for (const t of n.frontmatter.tags ?? []) tagSet.add(t);

	return {
		users,
		recentNotes: notes.slice(0, 10).map((n) => ({
			id: n.frontmatter.id,
			title: n.frontmatter.title,
			summary: n.frontmatter.summary,
			owner: n.owner,
			tags: n.frontmatter.tags ?? []
		})),
		tags: [...tagSet].sort()
	};
}
