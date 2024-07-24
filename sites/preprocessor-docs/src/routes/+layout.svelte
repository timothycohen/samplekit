<script lang="ts">
	import '@samplekit/preprocess-katex/katex.css';
	import '../app.css';
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { createThemeControllerCtx } from '$lib/styles';

	const { children } = $props();

	createThemeControllerCtx();

	const smoothNavigationOnlyOnSamePage = () => {
		if (browser) document.body.style.scrollBehavior = 'smooth';

		beforeNavigate(({ from, to }) => {
			if (from?.route.id === to?.route.id) return;
			document.body.style.scrollBehavior = 'auto';
		});

		afterNavigate(() => {
			tick().then(() => {
				document.body.style.scrollBehavior = 'smooth';
			});
		});
	};

	smoothNavigationOnlyOnSamePage();
</script>

{@render children()}
