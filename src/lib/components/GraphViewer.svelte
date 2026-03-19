<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import type { GraphData, GraphNode as GNode } from '$lib/types/index.js';
	import {
		forceSimulation,
		forceLink,
		forceManyBody,
		forceCenter,
		forceCollide,
		type SimulationNodeDatum,
		type SimulationLinkDatum
	} from 'd3-force';

	interface Props {
		dataUrl: string;
		focusNode?: string;
		fullscreen?: boolean;
	}
	let { dataUrl, focusNode, fullscreen = false }: Props = $props();

	let canvasEl: HTMLCanvasElement | undefined = $state();
	let hoveredNode: VisNode | null = $state(null);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let loading = $state(true);
	let errorMsg = $state('');

	type NodeType = 'user' | 'note' | 'tag' | 'external';
	let activeFilters: Record<NodeType, boolean> = $state({
		user: true,
		note: true,
		tag: false,
		external: false
	});

	const TYPE_COLORS: Record<string, string> = {
		user: '#a78bfa',
		note: '#34d399',
		tag: '#fbbf24',
		external: '#63636e'
	};
	const TYPE_LABELS: Record<NodeType, string> = {
		user: 'User',
		note: 'Note',
		tag: 'Tag',
		external: 'External'
	};
	const EDGE_COLOR = 'rgba(167, 139, 250, 0.10)';
	const EDGE_HIGHLIGHT = 'rgba(167, 139, 250, 0.30)';

	interface VisNode extends SimulationNodeDatum {
		id: string;
		nodeType: string;
		label: string;
		radius: number;
		color: string;
		meta?: Record<string, unknown>;
	}

	interface VisEdge extends SimulationLinkDatum<VisNode> {
		source: VisNode;
		target: VisNode;
		edgeType: string;
	}

	let allNodes: VisNode[] = [];
	let allEdges: VisEdge[] = [];
	let nodes: VisNode[] = [];
	let edges: VisEdge[] = [];
	let simulation: ReturnType<typeof forceSimulation<VisNode>> | null = null;
	let containerWidth = $state(0);
	let containerHeight = $state(0);
	let wrapperEl: HTMLDivElement | undefined = $state();

	let transform = { x: 0, y: 0, k: 1 };
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let dragNode: VisNode | null = null;
	let didDrag = false;
	let userHasInteracted = false;

	// Touch state
	let lastTouchDist = 0;
	let lastTouchCenter = { x: 0, y: 0 };

	function buildGraph(data: GraphData) {
		const nodeMap = new Map<string, VisNode>();
		allNodes = data.nodes.map((n) => {
			const connections = data.edges.filter(
				(e) => e.source === n.id || e.target === n.id
			).length;
			const vn: VisNode = {
				id: n.id,
				nodeType: n.type,
				label: n.label,
				radius: n.type === 'user' ? 10 + Math.sqrt(connections) * 3
					: n.type === 'tag' ? 7 + Math.sqrt(connections) * 2
					: n.type === 'note' ? 6 + Math.sqrt(connections) * 2.5
					: 4,
				color: TYPE_COLORS[n.type] ?? TYPE_COLORS.external,
				meta: n.meta
			};
			nodeMap.set(n.id, vn);
			return vn;
		});
		allEdges = data.edges
			.map((e) => {
				const s = nodeMap.get(e.source);
				const t = nodeMap.get(e.target);
				if (!s || !t) return null;
				return { source: s, target: t, edgeType: e.type } as VisEdge;
			})
			.filter((e): e is VisEdge => e !== null);
	}

	function applyFilters() {
		const visibleIds = new Set<string>();
		nodes = allNodes.filter((n) => {
			const visible = activeFilters[n.nodeType as NodeType] ?? true;
			if (visible) visibleIds.add(n.id);
			return visible;
		});
		edges = allEdges.filter(
			(e) => visibleIds.has(e.source.id) && visibleIds.has(e.target.id)
		);
	}

	function toggleFilter(type: NodeType) {
		activeFilters[type] = !activeFilters[type];
		userHasInteracted = false;
		applyFilters();
		restartSimulation();
	}

	// ── Auto-fit: compute transform to fit all nodes in viewport ──
	function fitToView() {
		if (nodes.length === 0) return;
		const w = containerWidth || 800;
		const h = containerHeight || 600;

		let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
		for (const n of nodes) {
			const r = n.radius;
			const nx = n.x ?? 0, ny = n.y ?? 0;
			if (nx - r < minX) minX = nx - r;
			if (ny - r < minY) minY = ny - r;
			if (nx + r > maxX) maxX = nx + r;
			if (ny + r > maxY) maxY = ny + r;
		}

		const graphW = maxX - minX;
		const graphH = maxY - minY;
		if (graphW <= 0 || graphH <= 0) return;

		const padding = 80;
		const scale = Math.min(
			(w - padding * 2) / graphW,
			(h - padding * 2) / graphH,
			3
		);
		const cx = (minX + maxX) / 2;
		const cy = (minY + maxY) / 2;

		transform.k = scale;
		transform.x = w / 2 - cx * scale;
		transform.y = h / 2 - cy * scale;
	}

	function startSimulation() {
		const w = containerWidth || 800;
		const h = containerHeight || 600;

		simulation = forceSimulation<VisNode>(nodes)
			.force(
				'link',
				forceLink<VisNode, VisEdge>(edges)
					.id((d) => d.id)
					.distance(80)
			)
			.force('charge', forceManyBody().strength(-200))
			.force('center', forceCenter(w / 2, h / 2))
			.force('collide', forceCollide<VisNode>().radius((d) => d.radius + 4))
			.on('tick', () => {
				// Keep auto-fitting until user interacts or simulation cools
				if (!userHasInteracted) fitToView();
				render();
			});
	}

	function restartSimulation() {
		simulation?.stop();
		startSimulation();
	}

	function render() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		const w = containerWidth || 800;
		const h = containerHeight || 600;

		const dpr = window.devicePixelRatio || 1;
		canvasEl.width = w * dpr;
		canvasEl.height = h * dpr;
		ctx.scale(dpr, dpr);

		ctx.clearRect(0, 0, w, h);
		ctx.save();
		ctx.translate(transform.x, transform.y);
		ctx.scale(transform.k, transform.k);

		for (const edge of edges) {
			const sx = edge.source.x ?? 0;
			const sy = edge.source.y ?? 0;
			const tx = edge.target.x ?? 0;
			const ty = edge.target.y ?? 0;
			const isHighlighted =
				focusNode && (edge.source.id === focusNode || edge.target.id === focusNode);
			ctx.beginPath();
			ctx.moveTo(sx, sy);
			ctx.lineTo(tx, ty);
			ctx.strokeStyle = isHighlighted ? EDGE_HIGHLIGHT : EDGE_COLOR;
			ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
			ctx.stroke();
		}

		const isMobile = window.matchMedia('(hover: none)').matches;

		for (const node of nodes) {
			const nx = node.x ?? 0;
			const ny = node.y ?? 0;
			const isFocused = node.id === focusNode;
			const isHovered = hoveredNode?.id === node.id;
			const r = isFocused ? node.radius * 1.4 : isHovered ? node.radius * 1.2 : node.radius;

			if (!isMobile) {
				ctx.shadowColor = node.color;
				ctx.shadowBlur = isFocused ? 18 : isHovered ? 14 : 5;
			}
			ctx.beginPath();
			ctx.arc(nx, ny, r, 0, Math.PI * 2);
			ctx.fillStyle = node.color;
			ctx.globalAlpha = isFocused ? 1 : isHovered ? 0.95 : 0.7;
			ctx.fill();
			ctx.globalAlpha = 1;
			ctx.shadowBlur = 0;
		}

		ctx.textAlign = 'center';
		for (const node of nodes) {
			const nx = node.x ?? 0;
			const ny = node.y ?? 0;
			const isFocused = node.id === focusNode;
			const isHovered = hoveredNode?.id === node.id;
			const r = isFocused ? node.radius * 1.4 : isHovered ? node.radius * 1.2 : node.radius;

			if (isFocused || isHovered) {
				ctx.font = 'bold 12px Inter, sans-serif';
				ctx.fillStyle = 'rgba(236, 236, 239, 0.95)';
				ctx.fillText(node.label, nx, ny - r - 8);
			} else {
				const label = node.label.length > 18 ? node.label.slice(0, 17) + '\u2026' : node.label;
				ctx.font = '10px Inter, sans-serif';
				ctx.fillStyle = 'rgba(236, 236, 239, 0.45)';
				ctx.fillText(label, nx, ny - r - 5);
			}
		}

		ctx.restore();
	}

	function getNodeAt(clientX: number, clientY: number): VisNode | null {
		if (!canvasEl) return null;
		const rect = canvasEl.getBoundingClientRect();
		const mx = (clientX - rect.left - transform.x) / transform.k;
		const my = (clientY - rect.top - transform.y) / transform.k;

		for (let i = nodes.length - 1; i >= 0; i--) {
			const n = nodes[i];
			const dx = (n.x ?? 0) - mx;
			const dy = (n.y ?? 0) - my;
			if (dx * dx + dy * dy < n.radius * n.radius * 1.5) return n;
		}
		return null;
	}

	// ── Mouse events ──
	function onMouseMove(e: MouseEvent) {
		if (dragNode) {
			didDrag = true;
			userHasInteracted = true;
			const rect = canvasEl!.getBoundingClientRect();
			dragNode.fx = (e.clientX - rect.left - transform.x) / transform.k;
			dragNode.fy = (e.clientY - rect.top - transform.y) / transform.k;
			simulation?.alpha(0.3).restart();
			return;
		}
		if (isDragging) {
			userHasInteracted = true;
			transform.x += e.clientX - dragStart.x;
			transform.y += e.clientY - dragStart.y;
			dragStart.x = e.clientX;
			dragStart.y = e.clientY;
			render();
			return;
		}
		const node = getNodeAt(e.clientX, e.clientY);
		hoveredNode = node;
		tooltipX = e.clientX;
		tooltipY = e.clientY;
		if (canvasEl) canvasEl.style.cursor = node ? 'pointer' : 'grab';
		render();
	}

	function onMouseDown(e: MouseEvent) {
		didDrag = false;
		const node = getNodeAt(e.clientX, e.clientY);
		if (node) {
			dragNode = node;
			dragNode.fx = node.x;
			dragNode.fy = node.y;
		} else {
			isDragging = true;
			dragStart.x = e.clientX;
			dragStart.y = e.clientY;
			if (canvasEl) canvasEl.style.cursor = 'grabbing';
		}
	}

	function onMouseUp() {
		if (dragNode) {
			dragNode.fx = null;
			dragNode.fy = null;
			dragNode = null;
			simulation?.alpha(0.3).restart();
		}
		isDragging = false;
		if (canvasEl) canvasEl.style.cursor = 'grab';
	}

	function onClick(e: MouseEvent) {
		if (didDrag) return;
		const node = getNodeAt(e.clientX, e.clientY);
		if (!node) return;
		if (node.nodeType === 'user') goto(`/users/${node.id}`);
		else if (node.nodeType === 'note') goto(`/notes/${node.id}`);
		else if (node.nodeType === 'tag') goto(`/tags/${node.id.replace('tag:', '')}`);
		else if (node.nodeType === 'external' && node.meta?.url)
			window.open(node.meta.url as string, '_blank');
	}

	function onWheel(e: WheelEvent) {
		e.preventDefault();
		userHasInteracted = true;
		const factor = e.deltaY > 0 ? 0.9 : 1.1;
		const rect = canvasEl!.getBoundingClientRect();
		const mx = e.clientX - rect.left;
		const my = e.clientY - rect.top;
		transform.x = mx - (mx - transform.x) * factor;
		transform.y = my - (my - transform.y) * factor;
		transform.k *= factor;
		transform.k = Math.max(0.3, Math.min(3, transform.k));
		render();
	}

	function onMouseLeave() {
		hoveredNode = null;
		isDragging = false;
		if (dragNode) { dragNode.fx = null; dragNode.fy = null; dragNode = null; }
		render();
	}

	// ── Touch events (mobile) ──
	function getTouchPos(t: Touch) {
		const rect = canvasEl!.getBoundingClientRect();
		return { x: t.clientX - rect.left, y: t.clientY - rect.top };
	}

	function onTouchStart(e: TouchEvent) {
		if (!canvasEl) return;
		didDrag = false;

		if (e.touches.length === 1) {
			const t = e.touches[0];
			const node = getNodeAt(t.clientX, t.clientY);
			if (node) {
				dragNode = node;
				dragNode.fx = node.x;
				dragNode.fy = node.y;
			} else {
				isDragging = true;
				dragStart.x = t.clientX;
				dragStart.y = t.clientY;
			}
		} else if (e.touches.length === 2) {
			// Pinch zoom setup
			const p1 = getTouchPos(e.touches[0]);
			const p2 = getTouchPos(e.touches[1]);
			lastTouchDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
			lastTouchCenter = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
			isDragging = false;
			if (dragNode) { dragNode.fx = null; dragNode.fy = null; dragNode = null; }
		}
	}

	function onTouchMove(e: TouchEvent) {
		if (!canvasEl) return;
		e.preventDefault();

		if (e.touches.length === 1) {
			const t = e.touches[0];
			if (dragNode) {
				didDrag = true;
				userHasInteracted = true;
				const rect = canvasEl.getBoundingClientRect();
				dragNode.fx = (t.clientX - rect.left - transform.x) / transform.k;
				dragNode.fy = (t.clientY - rect.top - transform.y) / transform.k;
				simulation?.alpha(0.3).restart();
			} else if (isDragging) {
				userHasInteracted = true;
				transform.x += t.clientX - dragStart.x;
				transform.y += t.clientY - dragStart.y;
				dragStart.x = t.clientX;
				dragStart.y = t.clientY;
				render();
			}
		} else if (e.touches.length === 2) {
			// Pinch zoom
			userHasInteracted = true;
			const p1 = getTouchPos(e.touches[0]);
			const p2 = getTouchPos(e.touches[1]);
			const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
			const center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

			if (lastTouchDist > 0) {
				const factor = dist / lastTouchDist;
				transform.x = center.x - (center.x - transform.x) * factor;
				transform.y = center.y - (center.y - transform.y) * factor;
				transform.k *= factor;
				transform.k = Math.max(0.3, Math.min(3, transform.k));
			}

			// Pan with center movement
			transform.x += center.x - lastTouchCenter.x;
			transform.y += center.y - lastTouchCenter.y;

			lastTouchDist = dist;
			lastTouchCenter = center;
			render();
		}
	}

	function onTouchEnd(e: TouchEvent) {
		if (e.touches.length === 0) {
			if (dragNode && !didDrag) {
				// Tap on node → navigate
				if (dragNode.nodeType === 'user') goto(`/users/${dragNode.id}`);
				else if (dragNode.nodeType === 'note') goto(`/notes/${dragNode.id}`);
				else if (dragNode.nodeType === 'tag') goto(`/tags/${dragNode.id.replace('tag:', '')}`);
				else if (dragNode.nodeType === 'external' && dragNode.meta?.url)
					window.open(dragNode.meta.url as string, '_blank');
			}
			if (dragNode) { dragNode.fx = null; dragNode.fy = null; dragNode = null; }
			isDragging = false;
			simulation?.alpha(0.3).restart();
		}
		lastTouchDist = 0;
	}

	function measure() {
		if (fullscreen) {
			containerWidth = window.innerWidth;
			containerHeight = window.innerHeight;
		} else if (wrapperEl) {
			containerWidth = wrapperEl.clientWidth;
			containerHeight = 600;
		}
	}

	onMount(async () => {
		try {
			measure();

			const res = await fetch(dataUrl);
			if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
			const data: GraphData = await res.json();

			buildGraph(data);
			applyFilters();
			loading = false;

			await new Promise((r) => requestAnimationFrame(r));
			startSimulation();
		} catch (e) {
			errorMsg = e instanceof Error ? e.message : 'Unknown error';
			loading = false;
		}
	});

	onDestroy(() => {
		simulation?.stop();
	});
</script>

<div class="graph-wrap" class:fullscreen bind:this={wrapperEl}>
	{#if fullscreen}
		<a href="/" class="graph-back" title="Back to home">
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
		</a>
	{/if}

	{#if !loading && !errorMsg}
		<div class="graph-toolbar">
			{#each (['user', 'note', 'tag', 'external'] as NodeType[]) as type}
				<button
					class="filter-btn"
					class:active={activeFilters[type]}
					style="--dot-color: {TYPE_COLORS[type]};"
					onclick={() => toggleFilter(type)}
				>
					<span class="filter-dot"></span>
					<span class="filter-label">{TYPE_LABELS[type]}</span>
				</button>
			{/each}
		</div>
	{/if}

	<canvas
		bind:this={canvasEl}
		style="width: 100%; height: {containerHeight || 600}px; touch-action: none;"
		onmousemove={onMouseMove}
		onmousedown={onMouseDown}
		onmouseup={onMouseUp}
		onclick={onClick}
		onwheel={onWheel}
		onmouseleave={onMouseLeave}
		ontouchstart={onTouchStart}
		ontouchmove={onTouchMove}
		ontouchend={onTouchEnd}
	></canvas>

	{#if loading}
		<div class="graph-overlay">
			<span class="loading-text">Loading graph...</span>
		</div>
	{:else if errorMsg}
		<div class="graph-overlay">
			<span style="color: #ef4444;">{errorMsg}</span>
		</div>
	{/if}

	{#if hoveredNode && !dragNode}
		<div
			class="graph-tooltip"
			style="left: {tooltipX + 12}px; top: {tooltipY - 8}px;"
		>
			<div class="tooltip-title">{hoveredNode.label}</div>
			{#if hoveredNode.meta?.summary || hoveredNode.meta?.bio}
				<div class="tooltip-desc">
					{hoveredNode.meta.summary ?? hoveredNode.meta.bio}
				</div>
			{/if}
			<div class="tooltip-meta">
				<span class="tooltip-type">{hoveredNode.nodeType}</span>
				{edges.filter((e) => e.source.id === hoveredNode?.id || e.target.id === hoveredNode?.id).length} connections
			</div>
		</div>
	{/if}
</div>

<style>
	.graph-wrap {
		position: relative;
		margin-top: 1.25rem;
		overflow: hidden;
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border);
		background: var(--color-bg-elevated);
	}

	.graph-wrap.fullscreen {
		position: fixed;
		inset: 0;
		z-index: 1000;
		margin: 0;
		border: none;
		border-radius: 0;
		background: var(--color-bg);
	}

	canvas {
		display: block;
		cursor: grab;
	}

	/* ── Back button ── */
	.graph-back {
		position: absolute;
		top: 0.875rem;
		left: 0.875rem;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: var(--color-text-secondary);
		background: rgba(9, 9, 11, 0.7);
		backdrop-filter: blur(8px);
		border: 1px solid var(--color-border);
		transition: all 0.2s var(--ease-out);
	}

	.graph-back:hover {
		color: var(--color-text);
		background: rgba(9, 9, 11, 0.85);
		border-color: var(--color-border-hover);
	}

	/* ── Toolbar ── */
	.graph-toolbar {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 10;
		display: flex;
		gap: 0.25rem;
		background: rgba(9, 9, 11, 0.7);
		backdrop-filter: blur(8px);
		padding: 0.25rem;
		border-radius: 100px;
		border: 1px solid var(--color-border);
	}

	.filter-btn {
		all: unset;
		display: flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.6875rem;
		font-weight: 500;
		font-family: var(--font-sans);
		color: var(--color-text-tertiary);
		padding: 0.25rem 0.625rem;
		border-radius: 100px;
		cursor: pointer;
		transition: all 0.15s ease;
		user-select: none;
	}

	.filter-btn:hover {
		color: var(--color-text-secondary);
		background: rgba(255, 255, 255, 0.04);
	}

	.filter-btn.active {
		color: var(--color-text);
		background: rgba(255, 255, 255, 0.06);
	}

	.filter-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--dot-color);
		opacity: 0.3;
		transition: opacity 0.15s;
		flex-shrink: 0;
	}

	.filter-btn.active .filter-dot {
		opacity: 1;
	}

	.graph-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.loading-text {
		color: var(--color-text-tertiary);
		font-size: 0.875rem;
	}

	/* ── Tooltip ── */
	.graph-tooltip {
		position: fixed;
		z-index: 700;
		max-width: 240px;
		padding: 8px 10px;
		background: rgba(9, 9, 11, 0.92);
		border: 1px solid var(--color-border);
		border-left: 2px solid var(--color-accent);
		border-radius: 6px;
		backdrop-filter: blur(8px);
		pointer-events: none;
		animation: tooltip-in 0.12s ease-out;
	}

	@keyframes tooltip-in {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.tooltip-title { font-size: 12px; font-weight: 600; color: var(--color-accent); margin-bottom: 3px; }
	.tooltip-desc { font-size: 10px; color: var(--color-text-secondary); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px; line-height: 1.4; }
	.tooltip-meta { font-size: 9px; color: var(--color-text-tertiary); display: flex; align-items: center; gap: 0.375rem; }
	.tooltip-type { text-transform: uppercase; letter-spacing: 0.04em; font-weight: 600; }

	/* ── Mobile ── */
	@media (max-width: 640px) {
		.graph-back {
			width: 36px;
			height: 36px;
			top: 0.625rem;
			left: 0.625rem;
		}

		.graph-toolbar {
			top: 0.625rem;
			right: 0.625rem;
			padding: 0.2rem;
			gap: 0.125rem;
		}

		.filter-btn {
			padding: 0.25rem 0.375rem;
		}

		.filter-label {
			display: none;
		}

		.filter-dot {
			width: 10px;
			height: 10px;
		}

		.graph-tooltip {
			display: none;
		}
	}
</style>
