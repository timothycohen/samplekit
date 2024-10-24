<script lang="ts">
	import { katex } from '@samplekit/preprocess-katex/katex.js';

	const { eq }: { eq: string } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html katex.renderToString(eq)}
