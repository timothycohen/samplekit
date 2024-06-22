<script lang="ts">
	import CodeProcess from '../../CodeProcess.svelte';
	import CodeRender from '../../CodeRender.svelte';
	import CodeWrite from '../../CodeWrite.svelte';
	import Layout from './Layout.svelte';
</script>

<Layout title="Preprocessing Code Blocks">
	{#snippet write()}
		<CodeWrite />
	{/snippet}

	{#snippet process()}
		<CodeProcess />
	{/snippet}

	{#snippet render()}
		<CodeRender />
	{/snippet}
</Layout>
