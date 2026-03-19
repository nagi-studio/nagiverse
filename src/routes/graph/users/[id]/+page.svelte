<script lang="ts">
	import { page } from '$app/stores';
	import GraphViewer from '$lib/components/GraphViewer.svelte';

	const userId = $derived($page.params.id);
</script>

<svelte:head>
	<title>{userId}'s Graph - Nagi</title>
</svelte:head>

<GraphViewer dataUrl="/generated/users/{userId}.graph.json" focusNode={userId} fullscreen />
