<script lang="ts">
	import '@samplekit/preprocess-katex/katex.css';
	import '../app.css';
	import { createThemeControllerContext } from '$lib/styles';

	const { children } = $props();

	createThemeControllerContext();
</script>

{@render children()}
