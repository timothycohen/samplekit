<script lang="ts">
	import { katex } from '..';

	const { eq }: { eq: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div class="overflow-x-auto">{@html katex.renderToString(eq, { displayMode: true })}</div>
