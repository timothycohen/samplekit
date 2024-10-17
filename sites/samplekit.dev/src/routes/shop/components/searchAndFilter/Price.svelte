<script lang="ts">
	import { cap } from '$lib/utils/common';
	import { useSearchAndFilterCtx } from '../../searchAndFilter.ctx';

	const {
		params: { price },
	} = $state(useSearchAndFilterCtx());
</script>

<div class="space-y-2">
	<span class="text-sm font-bold">Price</span>

	<div class="flex items-center gap-2">
		{#each price.paramKeys as paramKey, i}
			<input
				type="number"
				class="input-text"
				min="0"
				aria-label={paramKey}
				max={price.absMax}
				placeholder={cap(paramKey)}
				value={$price[paramKey]}
				onkeydown={(e) => {
					if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
					if (e.currentTarget.value.length === price.absMax.toString().length && e.key.match(/[0-9]/)) {
						price.set({ [paramKey]: price.absMax }, { nogo: true });
						e.preventDefault();
					}
				}}
				onpaste={(e) => {
					e.preventDefault();
					price.setParams({ [paramKey]: e.clipboardData?.getData('text') ?? null });
				}}
				onchange={(e) => price.setParams({ [paramKey]: e.currentTarget.value })}
			/>

			{#if !i}
				<span class="text-sm text-gray-8">–</span>
			{/if}
		{/each}
	</div>
</div>
