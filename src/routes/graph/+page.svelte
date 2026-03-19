<script lang="ts">
	import GraphViewer from '$lib/components/GraphViewer.svelte';
</script>

<svelte:head>
	<title>Knowledge Graph - Nagi</title>
</svelte:head>

<GraphViewer dataUrl="/generated/graph.full.json" fullscreen />
