<script lang="ts">
	import { cap } from '$lib/utils/common';
	import { useSearchAndFilterService } from '$routes/shop/services';

	const {
		params: { price },
	} = useSearchAndFilterService();
</script>

<div class="space-y-2">
	<span class="text-sm font-bold">Price</span>

	<div class="flex items-center gap-2">
		{#each price.paramKeys as paramKey, i}
			<input
				type="number"
				class="input-text"
				min="0"
				max={price.absMax}
				placeholder={cap(paramKey)}
				value={$price[paramKey]}
				on:keydown={(e) => {
					if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
					if (e.currentTarget.value.length === price.absMax.toString().length && e.key.match(/[0-9]/)) {
						price.set({ [paramKey]: price.absMax }, { nogo: true });
						e.preventDefault();
					}
				}}
				on:paste|preventDefault={(e) => price.setParam({ [paramKey]: e.clipboardData?.getData('text') ?? null })}
				on:change={(e) => price.setParam({ [paramKey]: e.currentTarget.value })}
			/>

			{#if !i}
				<span class="text-gray-8 text-sm">–</span>
			{/if}
		{/each}
	</div>
</div>
