/**
 * Content validation script.
 * Runs schema validation, ID uniqueness checks, and reference integrity checks.
 */
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { loadAllUsers, loadAllNotes } from './load-content.js';

const ROOT = resolve(import.meta.dirname, '..');

const ajv = new (Ajv2020.default ?? Ajv2020)({ allErrors: true });
(addFormats.default ?? addFormats)(ajv);

const profileSchema = JSON.parse(
	readFileSync(join(ROOT, 'schemas', 'profile.schema.json'), 'utf-8')
);
const noteSchema = JSON.parse(
	readFileSync(join(ROOT, 'schemas', 'note.schema.json'), 'utf-8')
);

const validateProfile = ajv.compile(profileSchema);
const validateNote = ajv.compile(noteSchema);

let errors = 0;

function fail(msg: string) {
	console.error(`  ERROR: ${msg}`);
	errors++;
}

// ── Load content ──
const users = loadAllUsers();
const notes = loadAllNotes();

console.log(`Validating ${users.length} users, ${notes.length} notes...\n`);

// ── 1. Schema validation ──
console.log('--- Schema validation ---');

for (const { profile, dirName } of users) {
	if (!validateProfile(profile)) {
		fail(`users/${dirName}/profile.yaml: ${ajv.errorsText(validateProfile.errors)}`);
	}
}

for (const { doc } of notes) {
	if (!validateNote(doc.frontmatter)) {
		fail(`note ${doc.frontmatter.id ?? '(no id)'}: ${ajv.errorsText(validateNote.errors)}`);
	}
}

// ── 2. Directory / ID consistency ──
console.log('--- Directory / ID consistency ---');

for (const { profile, dirName } of users) {
	if (profile.id !== dirName) {
		fail(`users/${dirName}: profile.id "${profile.id}" does not match directory name "${dirName}"`);
	}
}

// ── 3. ID uniqueness ──
console.log('--- ID uniqueness ---');

const userIds = new Set<string>();
for (const { profile } of users) {
	if (userIds.has(profile.id)) {
		fail(`Duplicate user id: "${profile.id}"`);
	}
	userIds.add(profile.id);
}

const noteIds = new Set<string>();
for (const { doc } of notes) {
	if (noteIds.has(doc.frontmatter.id)) {
		fail(`Duplicate note id: "${doc.frontmatter.id}"`);
	}
	noteIds.add(doc.frontmatter.id);
}

// ── 4. Reference integrity ──
console.log('--- Reference integrity ---');

for (const { doc } of notes) {
	const nid = doc.frontmatter.id;

	// Check related_users exist
	for (const uid of doc.frontmatter.related_users ?? []) {
		if (!userIds.has(uid)) {
			fail(`note "${nid}": related_users references unknown user "${uid}"`);
		}
	}

	// Check related_notes exist
	for (const rid of doc.frontmatter.related_notes ?? []) {
		if (!noteIds.has(rid)) {
			fail(`note "${nid}": related_notes references unknown note "${rid}"`);
		}
	}

	// Check wiki links resolve
	for (const wl of doc.wikiLinks) {
		if (wl.startsWith('@')) {
			const uid = wl.slice(1);
			if (!userIds.has(uid)) {
				fail(`note "${nid}": wiki link [[${wl}]] references unknown user "${uid}"`);
			}
		} else if (!noteIds.has(wl) && !userIds.has(wl)) {
			fail(`note "${nid}": wiki link [[${wl}]] does not resolve to any user or note`);
		}
	}
}

// ── Result ──
console.log('');
if (errors > 0) {
	console.error(`Validation failed with ${errors} error(s).`);
	process.exit(1);
} else {
	console.log('All validations passed.');
}
