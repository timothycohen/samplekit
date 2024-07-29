<script lang="ts">
	import TableProcess from '../../TableProcess.svelte';
	import TableRender from '../../TableRender.svelte';
	import TableWrite from '../../TableWrite.svelte';
	import Layout from './Layout.svelte';
</script>

<Layout title="Preprocessing Tables">
	{#snippet write()}
		<TableWrite />
	{/snippet}

	{#snippet process()}
		<TableProcess />
	{/snippet}

	{#snippet render()}
		<div class="prose prose-lg prose-radix">
			<div class="code-wrapper px-8 [&_*]:!font-sans [&_*]:!text-gray-12">
				<TableRender />
			</div>
		</div>
	{/snippet}
</Layout>
