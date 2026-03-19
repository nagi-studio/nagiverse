<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Nagi Group</title>
	<meta name="description" content="Community-driven knowledge graph and resource curation." />
</svelte:head>

<div class="page-hero">
	<h1 class="page-title">Knowledge, connected.</h1>
	<p class="page-subtitle">A community-curated knowledge graph. Explore ideas, notes, and the people behind them.</p>
</div>

<div class="hero-actions">
	<a href="/graph" class="pill">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><line x1="12" y1="10" x2="5" y2="8"/><line x1="12" y1="10" x2="19" y2="8"/><line x1="12" y1="14" x2="5" y2="16"/><line x1="12" y1="14" x2="19" y2="16"/></svg>
		Explore graph
	</a>
</div>

<section class="section">
	<div class="section-header">
		<h2 class="section-title">Members</h2>
	</div>
	<div class="grid grid-2">
		{#each data.users as user}
			<a href="/users/{user.id}" class="card" style="display: block; text-decoration: none; color: inherit;">
				<div class="card-row">
					{#if user.avatar}
						<img src={user.avatar} alt={user.name} class="avatar avatar-sm" />
					{/if}
					<div class="card-row-content">
						<div class="card-title">{user.name}</div>
						{#if user.bio}
							<div class="card-desc">{user.bio}</div>
						{/if}
					</div>
				</div>
				{#if user.tags}
					<div class="card-meta">
						{#each user.tags as tag}
							<span class="tag">{tag}</span>
						{/each}
					</div>
				{/if}
			</a>
		{/each}
	</div>
</section>

<section class="section">
	<div class="section-header">
		<h2 class="section-title">Recent notes</h2>
	</div>
	<div class="grid grid-2">
		{#each data.recentNotes as note}
			<a href="/notes/{note.id}" class="card" style="display: block; text-decoration: none; color: inherit;">
				<div class="card-title">{note.title}</div>
				{#if note.summary}
					<div class="card-desc">{note.summary}</div>
				{/if}
				<div class="card-meta">
					<span class="card-meta-text">{note.owner}</span>
					{#each note.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			</a>
		{/each}
	</div>
</section>

<section class="section">
	<div class="section-header">
		<h2 class="section-title">Topics</h2>
	</div>
	<div class="tags-cloud">
		{#each data.tags as tag}
			<a href="/tags/{tag}" class="tag tag-lg">{tag}</a>
		{/each}
	</div>
</section>

<style>
	.hero-actions {
		margin-top: 1.25rem;
		display: flex;
		gap: 0.75rem;
	}
	.card-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}
	.card-row-content {
		min-width: 0;
	}
	.tags-cloud {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.tag-lg {
		font-size: 0.8125rem;
		padding: 0.375em 0.875em;
	}
</style>
