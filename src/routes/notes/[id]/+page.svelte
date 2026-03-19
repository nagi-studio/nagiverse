<script lang="ts">
	let { data } = $props();
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

	<div class="prose">
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
</style>
