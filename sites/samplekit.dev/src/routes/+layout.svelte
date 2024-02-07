<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { themeController } from '$lib/styles';

	onMount(() => {
		const { destroy } = themeController.listen('light-dark-system');
		return destroy;
	});
</script>

<slot />
