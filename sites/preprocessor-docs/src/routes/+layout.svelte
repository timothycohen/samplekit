<script lang="ts">
	import '@samplekit/preprocess-katex/katex.css';
	import '../app.css';
	import { tick } from 'svelte';
	import { browser } from '$app/environment';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { getStoredThemeOnClient, createThemeControllerCtx } from '$lib/styles';

	const { children } = $props();

	createThemeControllerCtx(getStoredThemeOnClient());

	const smoothNavigationOnlyOnSamePage = () => {
		if (browser) document.documentElement.style.scrollBehavior = 'smooth';

		beforeNavigate(({ from, to }) => {
			if (from?.route.id === to?.route.id) return;
			document.documentElement.style.scrollBehavior = 'auto';
		});

		afterNavigate(() => {
			tick().then(() => {
				document.documentElement.style.scrollBehavior = 'smooth';
			});
		});
	};

	smoothNavigationOnlyOnSamePage();
</script>

{@render children()}
