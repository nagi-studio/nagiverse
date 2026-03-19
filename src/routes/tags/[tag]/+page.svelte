<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>#{data.tag} - Nagi</title>
</svelte:head>

<div class="page-hero">
	<h1 class="page-title">#{data.tag}</h1>
	<p class="page-subtitle">
		{data.users.length} member{data.users.length === 1 ? '' : 's'} &middot;
		{data.notes.length} note{data.notes.length === 1 ? '' : 's'}
	</p>
</div>

<div style="margin-bottom: 0.5rem;">
	<a href="/graph" class="pill pill-sm">
		<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><line x1="12" y1="10" x2="5" y2="8"/><line x1="12" y1="10" x2="19" y2="8"/></svg>
		View in graph
	</a>
</div>

{#if data.users.length > 0}
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">Members</h2>
		</div>
		<div class="grid grid-3">
			{#each data.users as user}
				<a href="/users/{user.id}" class="card" style="display: block; text-decoration: none; color: inherit;">
					<div class="card-title">{user.name}</div>
					{#if user.bio}
						<div class="card-desc">{user.bio}</div>
					{/if}
				</a>
			{/each}
		</div>
	</section>
{/if}

{#if data.notes.length > 0}
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">Notes</h2>
		</div>
		<div class="grid grid-2">
			{#each data.notes as note}
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
{/if}

<style>
	.pill-sm {
		font-size: 0.75rem;
		padding: 0.25rem 0.625rem;
	}
</style>
