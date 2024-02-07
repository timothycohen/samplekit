<script lang="ts">
	import Variant from './ProductVariant.svelte';
	import type { ProductOption, ProductVariant } from '$lib/shop';
	import type { ProductOptionWithAvailableForSale } from '$routes/shop/utils';

	export let options: ProductOption[];
	export let variants: ProductVariant[];
	export let partialVariant: Record<string, string>;

	const hasNoOptionsOrJustOneOption = !options.length || (options.length === 1 && options[0]?.values.length === 1);

	const combinations: { id: string; availableForSale: boolean; variant: Record<string, string> }[] = variants.map(
		(variant) => ({
			id: variant.id,
			availableForSale: variant.availableForSale,
			variant: variant.selectedOptions.reduce(
				(accumulator, option) => ({ ...accumulator, [option.name.toLowerCase()]: option.value.toLowerCase() }),
				{},
			),
		}),
	);

	const checkIfVariantIsAvailableForSale = (
		current: Record<string, string>,
		variant: { cleanOption: string; cleanValue: string },
	) => {
		const next = { ...current, [variant.cleanOption]: variant.cleanValue };
		const keys = Object.keys(next);
		return !!combinations.find(
			(combination) => keys.every((key) => combination.variant[key] === next[key]) && combination.availableForSale,
		)?.availableForSale;
	};

	const loadOptions = (
		current: Record<string, string>,
		options: ProductOption[],
	): ProductOptionWithAvailableForSale[] => {
		return options.map((o) => {
			const cleanOption = o.name.toLowerCase();
			return {
				id: o.id,
				name: o.name,
				clean: cleanOption,
				values: o.values.map((v) => {
					const cleanValue = v.toLowerCase();
					return {
						name: v,
						clean: cleanValue,
						available: checkIfVariantIsAvailableForSale(current, {
							cleanOption,
							cleanValue,
						}),
					};
				}),
			};
		});
	};

	$: loadedOptions = loadOptions(partialVariant, options);
</script>

{#if !hasNoOptionsOrJustOneOption}
	{#each loadedOptions as option (option.id)}
		<Variant {option} />
	{/each}
{/if}
