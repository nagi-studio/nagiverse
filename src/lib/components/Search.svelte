<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	let query = $state('');
	let results: { id: string; type: string; title: string; summary?: string }[] = $state([]);
	let focused = $state(false);
	let miniSearch: any = null;

	onMount(async () => {
		const MiniSearch = (await import('minisearch')).default;
		try {
			const res = await fetch('/generated/search-index.json');
			const data = await res.json();
			miniSearch = MiniSearch.loadJSON(JSON.stringify(data), {
				fields: ['title', 'summary', 'tags', 'body'],
				storeFields: ['id', 'type', 'title', 'summary', 'tags', 'owner']
			});
		} catch {
			// search unavailable
		}
	});

	function doSearch() {
		if (!miniSearch || !query.trim()) {
			results = [];
			return;
		}
		results = miniSearch.search(query, { prefix: true, fuzzy: 0.2 }).slice(0, 8);
	}

	function navigate(result: { id: string; type: string }) {
		const [type, id] = result.id.split(':');
		if (type === 'user') goto(`/users/${id}`);
		else if (type === 'note') goto(`/notes/${id}`);
		query = '';
		results = [];
		focused = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			query = '';
			results = [];
			focused = false;
			(e.target as HTMLInputElement)?.blur();
		}
	}
</script>

<div class="search-wrapper">
	<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
		<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
	</svg>
	<input
		type="text"
		class="search-input"
		placeholder="Search..."
		bind:value={query}
		onfocus={() => (focused = true)}
		onblur={() => setTimeout(() => (focused = false), 200)}
		oninput={() => doSearch()}
		onkeydown={handleKeydown}
	/>
	{#if focused && results.length > 0}
		<div class="search-results">
			{#each results as r}
				<button
					class="search-result-btn"
					onmousedown={() => navigate(r)}
				>
					<span class="result-badge" class:result-badge-user={r.type === 'user'} class:result-badge-note={r.type === 'note'}>
						{r.type}
					</span>
					<span class="result-title">{r.title}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.search-result-btn {
		all: unset;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		padding: 0.625rem 0.875rem;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		cursor: pointer;
		box-sizing: border-box;
		transition: all 0.1s;
	}
	.search-result-btn:not(:last-child) {
		border-bottom: 1px solid var(--color-border);
	}
	.search-result-btn:hover {
		background: var(--color-bg-hover);
		color: var(--color-text);
	}
	.result-badge {
		font-size: 0.625rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding: 0.125em 0.4em;
		border-radius: 3px;
		flex-shrink: 0;
		background: var(--color-bg-subtle);
		color: var(--color-text-tertiary);
	}
	.result-badge-user {
		background: var(--color-accent-dim);
		color: var(--color-accent);
	}
	.result-badge-note {
		background: var(--color-green-dim);
		color: var(--color-green);
	}
	.result-title {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
