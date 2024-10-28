<script lang="ts">
	import { slide } from 'svelte/transition';

	const items: number[] = $state([]);
	let key = 0;

	export function addItems(count: number) {
		for (let i = 0; i < count; i++) {
			items.push(key++);
		}
		if (items.length > 100) {
			items.splice(0, 50);
		}
	}
</script>

<div class="relative">
	<div class="absolute right-0 flex justify-end gap-1">
		{#each items as item (item)}
			<span class="rotate-90 text-3xl" transition:slide={{ axis: 'x' }}>🍕</span>
		{/each}
	</div>
</div>
