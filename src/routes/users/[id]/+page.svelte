<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>{data.user.name} - Nagi</title>
</svelte:head>

<div class="profile-header">
	{#if data.user.avatar}
		<img src={data.user.avatar} alt={data.user.name} class="avatar avatar-lg" />
	{/if}
	<div>
		<h1 class="page-title" style="margin-bottom: 0;">{data.user.name}</h1>
		{#if data.user.bio}
			<p class="page-subtitle">{data.user.bio}</p>
		{/if}
	</div>
</div>

<div class="profile-meta">
	{#if data.user.tags}
		{#each data.user.tags as tag}
			<a href="/tags/{tag}" class="tag">{tag}</a>
		{/each}
	{/if}
	{#if data.user.links}
		{#each Object.entries(data.user.links) as [name, url]}
			<a href={url} target="_blank" rel="noopener" class="pill pill-sm">{name}</a>
		{/each}
	{/if}
	<a href="/graph/users/{data.user.id}" class="pill pill-sm">
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><line x1="12" y1="10" x2="5" y2="8"/><line x1="12" y1="10" x2="19" y2="8"/></svg>
		Graph
	</a>
</div>

<section class="section">
	<div class="section-header">
		<h2 class="section-title">Notes</h2>
		<span class="section-title" style="opacity: 0.5;">{data.notes.length}</span>
	</div>
	{#if data.notes.length === 0}
		<p class="empty-state">No notes yet.</p>
	{:else}
		<div class="grid grid-2">
			{#each data.notes as note}
				<a href="/notes/{note.id}" class="card" style="display: block; text-decoration: none; color: inherit;">
					<div class="card-title">{note.title}</div>
					{#if note.summary}
						<div class="card-desc">{note.summary}</div>
					{/if}
					<div class="card-meta">
						{#each note.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.profile-header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		margin-top: 3rem;
	}
	.profile-meta {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		align-items: center;
		margin-top: 1.25rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--color-border);
	}
	.pill-sm {
		font-size: 0.75rem;
		padding: 0.25rem 0.625rem;
	}
	.empty-state {
		color: var(--color-text-tertiary);
		font-size: 0.875rem;
		padding: 2rem 0;
	}
</style>
