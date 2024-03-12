<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Tweened } from 'svelte/motion';

	export let uploadProgress: Tweened<number>;
</script>

<div class="bg-accent-9 absolute bottom-0 h-5" out:fade style="width: {$uploadProgress}%" />
