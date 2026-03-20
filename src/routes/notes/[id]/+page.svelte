<script lang="ts">
	import { onMount } from 'svelte';
	let { data } = $props();
	let proseEl: HTMLDivElement;

	onMount(() => {
		if (!proseEl) return;
		// Find the "Arena" h2
		const h2s = proseEl.querySelectorAll('h2');
		let arenaH2: HTMLElement | null = null;
		for (const h2 of h2s) {
			if (h2.textContent?.includes('Arena')) {
				arenaH2 = h2;
				break;
			}
		}
		if (!arenaH2) return;

		// Collect h3+table groups after the Arena h2
		type TabGroup = { heading: HTMLElement; table: HTMLElement; label: string };
		const months: TabGroup[] = [];
		let prediction: TabGroup | null = null;
		let el = arenaH2.nextElementSibling;
		// Skip the blockquote description
		while (el && el.tagName === 'BLOCKQUOTE') el = el.nextElementSibling;

		while (el && el.tagName !== 'H2' && el.tagName !== 'HR') {
			if (el.tagName === 'H3') {
				const heading = el as HTMLElement;
				const table = heading.nextElementSibling;
				if (table && table.tagName === 'TABLE') {
					const label = heading.textContent?.trim() ?? '';
					const group = { heading, table: table as HTMLElement, label };
					if (label.includes('预言')) {
						prediction = group;
					} else {
						months.push(group);
					}
					el = table.nextElementSibling;
					continue;
				}
			}
			el = el.nextElementSibling;
		}

		if (months.length < 2) return;

		// Build tab container
		const container = document.createElement('div');
		container.className = 'arena-tabs';

		// Tab bar
		const tabBar = document.createElement('div');
		tabBar.className = 'arena-tab-bar';

		// Tab panels
		const panels = document.createElement('div');
		panels.className = 'arena-panels';

		months.forEach((group, i) => {
			// Create tab button
			const btn = document.createElement('button');
			btn.className = 'arena-tab-btn' + (i === 0 ? ' active' : '');
			btn.textContent = group.label;
			btn.addEventListener('click', () => {
				tabBar.querySelectorAll('.arena-tab-btn').forEach(b => b.classList.remove('active'));
				btn.classList.add('active');
				panels.querySelectorAll('.arena-panel').forEach(p => (p as HTMLElement).classList.remove('active'));
				panels.children[i]?.classList.add('active');
			});
			tabBar.appendChild(btn);

			// Create panel
			const panel = document.createElement('div');
			panel.className = 'arena-panel' + (i === 0 ? ' active' : '');
			panel.appendChild(group.table);
			panels.appendChild(panel);
		});

		container.appendChild(tabBar);
		container.appendChild(panels);

		// Prediction section (separate)
		let predictionSection: HTMLElement | null = null;
		if (prediction) {
			predictionSection = document.createElement('div');
			predictionSection.className = 'arena-prediction';
			const predTitle = document.createElement('h3');
			predTitle.textContent = '🔮 ' + prediction.label;
			predictionSection.appendChild(predTitle);
			predictionSection.appendChild(prediction.table);
		}

		// Remove original h3 headings (tables already moved to panels)
		for (const g of months) g.heading.remove();
		if (prediction) prediction.heading.remove();

		// Insert tab container after the blockquote
		let insertPoint = arenaH2.nextElementSibling;
		while (insertPoint && insertPoint.tagName === 'BLOCKQUOTE') {
			insertPoint = insertPoint.nextElementSibling;
		}
		if (insertPoint) {
			insertPoint.parentNode?.insertBefore(container, insertPoint);
			if (predictionSection) {
				container.parentNode?.insertBefore(predictionSection, container.nextSibling);
			}
		}
	});
</script>

<svelte:head>
	<title>{data.note.title} - Nagi</title>
</svelte:head>

<article class="note-article">
	<div class="note-header">
		<h1 class="page-title">{data.note.title}</h1>
		<div class="note-meta">
			<a href="/users/{data.note.owner}" class="note-author">
				{data.ownerName}
			</a>
			{#if data.note.created_at}
				<span class="note-date">{data.note.created_at}</span>
			{/if}
		</div>
		{#if data.note.tags?.length}
			<div class="note-tags">
				{#each data.note.tags as tag}
					<a href="/tags/{tag}" class="tag">{tag}</a>
				{/each}
			</div>
		{/if}
	</div>

	{#if data.note.summary}
		<div class="note-summary">{data.note.summary}</div>
	{/if}

	<div class="prose" bind:this={proseEl}>
		{@html data.note.html}
	</div>

	{#if data.note.source_url}
		<div class="note-source">
			<a href={data.note.source_url} target="_blank" rel="noopener" class="pill">
				<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
				Source
			</a>
		</div>
	{/if}
</article>

{#if data.relatedNotes.length > 0 || data.relatedUsers.length > 0}
	<aside class="related">
		{#if data.relatedNotes.length > 0}
			<div class="related-section">
				<h3 class="section-title">Related Notes</h3>
				<div class="related-list">
					{#each data.relatedNotes as rn}
						<a href="/notes/{rn.id}" class="related-item">
							<span class="badge badge-note">Note</span>
							{rn.title}
						</a>
					{/each}
				</div>
			</div>
		{/if}
		{#if data.relatedUsers.length > 0}
			<div class="related-section">
				<h3 class="section-title">Related People</h3>
				<div class="related-list">
					{#each data.relatedUsers as ru}
						<a href="/users/{ru.id}" class="related-item">
							<span class="badge badge-user">User</span>
							{ru.name}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</aside>
{/if}

<style>
	.note-article {
		margin-top: 3rem;
		max-width: 720px;
	}
	.note-header {
		margin-bottom: 2rem;
	}
	.note-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.75rem;
	}
	.note-author {
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	.note-author:hover {
		color: var(--color-accent);
	}
	.note-date {
		font-size: 0.75rem;
		color: var(--color-text-tertiary);
	}
	.note-tags {
		display: flex;
		gap: 0.375rem;
		flex-wrap: wrap;
		margin-top: 0.75rem;
	}
	.note-summary {
		background: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: 1rem 1.25rem;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		line-height: 1.6;
		margin-bottom: 2rem;
		border-left: 3px solid var(--color-accent);
	}
	.note-source {
		margin-top: 2rem;
	}
	.related {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--color-border);
		display: flex;
		gap: 3rem;
	}
	.related-section {
		flex: 1;
	}
	.related-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.75rem;
	}
	.related-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		padding: 0.5rem 0.75rem;
		border-radius: var(--radius-sm);
		transition: all 0.15s var(--ease-out);
	}
	.related-item:hover {
		background: var(--color-bg-hover);
		color: var(--color-text);
	}

	/* ── Arena Tabs ── */
	:global(.arena-tabs) {
		margin-bottom: 1.5rem;
	}
	:global(.arena-tab-bar) {
		display: flex;
		gap: 0.375rem;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		padding-bottom: 0.5rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--color-border);
		scrollbar-width: none;
	}
	:global(.arena-tab-bar::-webkit-scrollbar) {
		display: none;
	}
	:global(.arena-tab-btn) {
		flex-shrink: 0;
		padding: 0.5rem 1rem;
		border: 1px solid var(--color-border);
		border-bottom: none;
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		background: transparent;
		color: var(--color-text-tertiary);
		font-family: var(--font-sans);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s var(--ease-out);
		white-space: nowrap;
	}
	:global(.arena-tab-btn:hover) {
		color: var(--color-text-secondary);
		background: var(--color-bg-hover);
	}
	:global(.arena-tab-btn.active) {
		color: var(--color-accent);
		background: var(--color-bg-card);
		border-color: var(--color-accent);
		border-bottom: 2px solid var(--color-bg);
		margin-bottom: -1px;
	}
	:global(.arena-panel) {
		display: none;
	}
	:global(.arena-panel.active) {
		display: block;
		animation: arena-fade 0.25s var(--ease-out);
	}
	@keyframes arena-fade {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}
	:global(.arena-prediction) {
		margin-top: 1.5rem;
		padding-top: 1.5rem;
		border-top: 1px dashed var(--color-border);
	}
	:global(.arena-prediction h3) {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-amber);
		margin-bottom: 0.75rem;
	}
</style>
