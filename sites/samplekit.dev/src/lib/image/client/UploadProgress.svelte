<script lang="ts">
	import { fade } from 'svelte/transition';
	import type { Tweened } from 'svelte/motion';

	interface Props {
		uploadProgress: Tweened<number>;
	}

	const { uploadProgress }: Props = $props();
</script>

<div class="absolute bottom-0 h-5 bg-accent-9" out:fade style="width: {$uploadProgress}%"></div>
