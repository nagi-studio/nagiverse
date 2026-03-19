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
	const allNotes = notesJson as NoteEntry[];

	const note = allNotes.find((n) => n.frontmatter.id === params.id);
	if (!note) error(404, `Note "${params.id}" not found`);

	const owner = users.find((u) => u.id === note.owner);

	// Resolve related notes
	const relatedNotes = (note.frontmatter.related_notes ?? [])
		.map((rid) => {
			const r = allNotes.find((n) => n.frontmatter.id === rid);
			return r ? { id: r.frontmatter.id, title: r.frontmatter.title } : null;
		})
		.filter(Boolean);

	// Resolve related users
	const relatedUsers = (note.frontmatter.related_users ?? [])
		.map((uid) => {
			const u = users.find((us) => us.id === uid);
			return u ? { id: u.id, name: u.name } : null;
		})
		.filter(Boolean);

	return {
		note: {
			...note.frontmatter,
			html: note.html,
			owner: note.owner,
			wikiLinks: note.wikiLinks
		},
		ownerName: owner?.name ?? note.owner,
		relatedNotes,
		relatedUsers
	};
}
