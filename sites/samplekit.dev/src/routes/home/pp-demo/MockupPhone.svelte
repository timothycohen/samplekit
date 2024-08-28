<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet } = $props();
</script>

<div class="aspect-[82/140] rounded-[50px] border-4 border-sand-11 bg-black p-2.5 shadow-4 dark:border-sand-12">
	<div class="h-full overflow-hidden rounded-[40px]">
		{@render children()}
	</div>
</div>
