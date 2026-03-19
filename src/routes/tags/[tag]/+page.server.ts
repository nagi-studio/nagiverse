import { error } from '@sveltejs/kit';
import usersJson from '$lib/generated/users.json';
import notesJson from '$lib/generated/notes.json';
import type { UserProfile, NoteFrontmatter } from '$lib/types/index.js';

export const prerender = true;

interface NoteEntry {
	frontmatter: NoteFrontmatter;
	owner: string;
}

export function load({ params }) {
	const tag = params.tag;
	const users = usersJson as UserProfile[];
	const notes = notesJson as NoteEntry[];

	const matchedUsers = users.filter((u) => u.tags?.includes(tag));
	const matchedNotes = notes
		.filter((n) => n.frontmatter.tags?.includes(tag))
		.map((n) => ({
			id: n.frontmatter.id,
			title: n.frontmatter.title,
			summary: n.frontmatter.summary,
			owner: n.owner,
			tags: n.frontmatter.tags ?? []
		}));

	if (matchedUsers.length === 0 && matchedNotes.length === 0) {
		error(404, `Tag "${tag}" not found`);
	}

	return { tag, users: matchedUsers, notes: matchedNotes };
}
