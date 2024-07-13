<script lang="ts">
	import { navbarHeightPx, useSidebarContext } from '$lib/nav';

	const { title, tag }: { title: string; tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' } = $props();

	const id = title.toLowerCase().replace(/\s+/g, '-');
	const href = '#' + id;

	const sidebar = useSidebarContext();
</script>

<svelte:element
	this={tag}
	data-toc
	{id}
	class="relative {sidebar.open ? 'scroll-mt-16' : ''}"
	style={sidebar.open ? `scroll-margin-top: ${navbarHeightPx}px` : ''}
>
	<a {href} class="group">
		<span
			class="absolute -left-4 bottom-0 top-0 content-center text-base opacity-0 transition-opacity group-hover:opacity-100"
		>
			#</span
		>
		<span class="text-gray-12">{title}</span>
	</a>
</svelte:element>
