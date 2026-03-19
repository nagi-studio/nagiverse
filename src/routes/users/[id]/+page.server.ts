import { error } from '@sveltejs/kit';
import usersJson from '$lib/generated/users.json';
import notesJson from '$lib/generated/notes.json';
import type { UserProfile, NoteFrontmatter } from '$lib/types/index.js';

export const prerender = true;

interface NoteEntry {
	frontmatter: NoteFrontmatter;
	owner: string;
	html: string;
	wikiLinks: string[];
}

export function load({ params }) {
	const users = usersJson as UserProfile[];
	const notes = notesJson as NoteEntry[];

	const user = users.find((u) => u.id === params.id);
	if (!user) error(404, `User "${params.id}" not found`);

	const userNotes = notes
		.filter((n) => n.owner === params.id)
		.map((n) => ({
			id: n.frontmatter.id,
			title: n.frontmatter.title,
			summary: n.frontmatter.summary,
			tags: n.frontmatter.tags ?? []
		}));

	return { user, notes: userNotes };
}
