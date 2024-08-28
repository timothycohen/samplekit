<script lang="ts">
	import I from '$lib/icons';

	const {
		title,
		tag,
		dataToc = true,
		id,
	}: { title: string; tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'; dataToc?: true | null; id?: string } = $props();

	const ID = id ?? title.toLowerCase().replace(/\s+/g, '-');
	const href = '#' + ID;
</script>

<!-- @component
This component is used to generate the TOC in `update-loaded-front-matter.json/+server.ts`

To match the regex correctly, ensure the props are ordered as tag, title, [id]
-->

<svelte:element this={tag} data-toc={dataToc} id={ID}>
	<a {href} class="group relative -mr-8 pr-8" data-sveltekit-replacestate>
		<span class="text-gray-12 group-hover:text-accent-12">{title}</span>
		<span
			class="absolute bottom-0 right-0 top-0 grid content-center
			opacity-0 transition-opacity group-hover:opacity-100"
		>
			<small><I.Link class="!stroke-2 text-accent-12" /></small></span
		>
	</a>
</svelte:element>
