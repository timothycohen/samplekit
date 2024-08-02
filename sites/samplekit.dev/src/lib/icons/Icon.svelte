<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	type Attrs = SVGAttributes<SVGSVGElement>;

	const {
		absoluteStrokeWidth,
		children,
		class: classes,
		...attrs
	}: { absoluteStrokeWidth?: boolean; children?: Snippet } & { name: string | null } & Omit<Attrs, 'name'> = $props();

	const _strokeWidth = Number(attrs['stroke-width'] ?? 2);
	const width = Number(attrs['width'] ?? 24);
	const strokeWidth = absoluteStrokeWidth ? _strokeWidth : _strokeWidth * (width / 24);
</script>

<svg
	xmlns="http://www.w3.org/2000/svg"
	height="24"
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-linecap="round"
	stroke-linejoin="round"
	{...attrs}
	class="custom-icon {classes ?? ''}"
	{width}
	stroke-width={strokeWidth}
>
	{@render children?.()}
</svg>
