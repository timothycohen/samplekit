<script lang="ts">
	import { run } from 'svelte/legacy';

	import Variant from './ProductVariant.svelte';
	import type { ProductOption, ProductVariant } from '$lib/shop';
	import type { ProductOptionWithAvailableForSale } from '$routes/shop/utils';

	interface Props {
		options: ProductOption[];
		variants: ProductVariant[];
		partialVariant: Record<string, string>;
	}

	const { options, variants, partialVariant }: Props = $props();

	type Combination = { id: string; availableForSale: boolean; variant: Record<string, string> };

	const checkIfVariantIsAvailableForSale = ({
		current,
		variant,
		combinations,
	}: {
		current: Record<string, string>;
		variant: { cleanOption: string; cleanValue: string };
		combinations: Combination[];
	}) => {
		const next = { ...current, [variant.cleanOption]: variant.cleanValue };
		const keys = Object.keys(next);
		return !!combinations.find(
			(combination) => keys.every((key) => combination.variant[key] === next[key]) && combination.availableForSale,
		)?.availableForSale;
	};

	const loadOptions = ({
		combinations,
		current,
		options,
	}: {
		current: Record<string, string>;
		options: ProductOption[];
		combinations: Combination[];
	}): ProductOptionWithAvailableForSale[] => {
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
						available: checkIfVariantIsAvailableForSale({
							current,
							variant: { cleanOption, cleanValue },
							combinations,
						}),
					};
				}),
			};
		});
	};

	let combinations: Combination[] = $state([]);
	run(() => {
		combinations = variants.map((variant) => ({
			id: variant.id,
			availableForSale: variant.availableForSale,
			variant: variant.selectedOptions.reduce(
				(accumulator, option) => ({ ...accumulator, [option.name.toLowerCase()]: option.value.toLowerCase() }),
				{},
			),
		}));
	});

	const hasNoOptionsOrJustOneOption = $derived(
		!options.length || (options.length === 1 && options[0]?.values.length === 1),
	);

	const loadedOptions = $derived(loadOptions({ current: partialVariant, options, combinations }));
</script>

{#if !hasNoOptionsOrJustOneOption}
	{#each loadedOptions as option (option.id)}
		<Variant {option} />
	{/each}
{/if}
