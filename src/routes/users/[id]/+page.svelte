<script lang="ts">
	let { data } = $props();

	const socialIcons: Record<string, { svg: string; label: string }> = {
		github: {
			label: 'GitHub',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>'
		},
		x: {
			label: 'X',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>'
		},
		bilibili: {
			label: 'Bilibili',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>'
		},
		zhihu: {
			label: '知乎',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24h12.56C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm1.964 4.078h6.748c.225 0 .409.163.437.387l.138 1.097a.445.445 0 0 1-.437.503H7.394a.228.228 0 0 0-.228.228v7.153c0 .126.102.228.228.228h2.108a.228.228 0 0 0 .228-.228V9.678c0-.126.103-.228.229-.228h1.427c.126 0 .228.102.228.228v5.504c0 .126-.102.228-.228.228H6.213a.228.228 0 0 1-.228-.228V5.85c0-.126.102-.228.228-.228zm8.236.068h1.591c.126 0 .228.103.228.229v4.543h.503l1.646-2.257a.228.228 0 0 1 .184-.094h1.786a.228.228 0 0 1 .184.364l-2.062 2.826 2.29 3.845a.228.228 0 0 1-.196.345h-1.885a.228.228 0 0 1-.197-.114l-1.528-2.626-.725.994v1.518a.228.228 0 0 1-.228.228h-1.591a.228.228 0 0 1-.228-.228V4.375c0-.126.102-.229.228-.229z"/></svg>'
		},
		blog: {
			label: 'Blog',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z"/></svg>'
		},
		huggingface: {
			label: 'HuggingFace',
			svg: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 7.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm3 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM7.5 14.25c0-.414.336-.75.75-.75h7.5a.75.75 0 0 1 .542 1.272C15.036 16.078 13.578 17.25 12 17.25s-3.036-1.172-4.292-2.478A.75.75 0 0 1 7.5 14.25z"/></svg>'
		}
	};
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
			{@const icon = socialIcons[name]}
			<a href={url} target="_blank" rel="noopener" class="social-link" title={icon?.label ?? name}>
				{#if icon}
					{@html icon.svg}
				{:else}
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
				{/if}
				<span>{icon?.label ?? name}</span>
			</a>
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
	.social-link {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.75rem;
		font-weight: 500;
		padding: 0.3rem 0.7rem;
		border-radius: 100px;
		border: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		transition: all 0.2s var(--ease-out);
		background: transparent;
	}
	.social-link:hover {
		border-color: var(--color-border-hover);
		color: var(--color-text);
		background: var(--color-bg-hover);
	}
	.social-link :global(svg) {
		flex-shrink: 0;
		opacity: 0.7;
	}
	.social-link:hover :global(svg) {
		opacity: 1;
	}
	.empty-state {
		color: var(--color-text-tertiary);
		font-size: 0.875rem;
		padding: 2rem 0;
	}
</style>
