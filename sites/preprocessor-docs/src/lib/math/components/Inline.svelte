<script lang="ts">
	import { katex } from '..';

	export const { eq } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html katex.renderToString(eq)}
