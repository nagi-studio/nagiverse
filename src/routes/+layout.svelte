<script lang="ts">
	import '../app.css';
	import Search from '$lib/components/Search.svelte';

	let { children } = $props();
</script>

<header class="site-header">
	<div class="container inner">
		<a href="/" class="logo">nagi</a>
		<nav>
			<a href="/" class="nav-link">Home</a>
			<a href="/graph" class="nav-link">Graph</a>
			<Search />
		</nav>
	</div>
</header>

<main class="container">
	{@render children()}
</main>

<footer class="site-footer">
	<div class="container">
		Open knowledge, curated by community
	</div>
</footer>
