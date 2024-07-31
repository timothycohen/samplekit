<script lang="ts">
	import { Link } from '$lib/styles/icons';

	const {
		title,
		tag,
		dataToc = true,
	}: { title: string; tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; dataToc?: true | null } = $props();

	const id = title.toLowerCase().replace(/\s+/g, '-');
	const href = '#' + id;
</script>

<svelte:element this={tag} data-toc={dataToc} {id}>
	<a {href} class="group relative -mr-8 pr-8">
		<span class="text-gray-12 group-hover:text-accent-12">{title}</span>
		<span
			class="absolute bottom-0 right-0 top-0 grid content-center
			opacity-0 transition-opacity group-hover:opacity-100"
		>
			<small><Link class="!stroke-2 text-accent-12" /></small></span
		>
	</a>
</svelte:element>
