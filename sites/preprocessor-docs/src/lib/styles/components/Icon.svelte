<script lang="ts" context="module">
	export type IconName = 'hamburger' | 'swatch' | 'chevron-up';
</script>

<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props {
		icon: IconName;
		class?: string | null | undefined;
		attrs?: Omit<SVGAttributes<SVGElement>, 'class'>;
	}

	const { icon, class: classes = 'h-6 w-6', attrs = {} }: Props = $props();
</script>

{#if icon === 'hamburger'}
	<!-- https://lucide.dev/icons/menu -->
	<svg
		{...attrs}
		class="icon__hamburger lucide lucide-menu {classes}"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<line x1="4" x2="20" y1="12" y2="12" />
		<line x1="4" x2="20" y1="6" y2="6" />
		<line x1="4" x2="20" y1="18" y2="18" />
	</svg>
{:else if icon === 'swatch'}
	<!-- https://melt-ui.com/docs/builders/tree -->
	<svg
		{...attrs}
		class="icon__swatch lucide lucide-swatch-book {classes}"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="M11 17a4 4 0 0 1-8 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2Z" />
		<path d="M16.7 13H19a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H7" />
		<path d="M 7 17h.01" />
		<path d="m11 8 2.3-2.3a2.4 2.4 0 0 1 3.404.004L18.6 7.6a2.4 2.4 0 0 1 .026 3.434L9.9 19.8" />
	</svg>
{:else if icon === 'chevron-up'}
	<svg
		{...attrs}
		class="icon__chevron-up lucide lucide-chevron-up {classes}"
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<path d="m18 15-6-6-6 6" />
	</svg>
{/if}
