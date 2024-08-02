<script lang="ts" generics="SvelteGeneric extends object">
	import { type createSelect, melt } from '@melt-ui/svelte';
	import I from '$lib/icons';

	type Option = { label: string; value: SvelteGeneric };

	interface Props {
		options: Record<string, Array<Option>> & { default?: Array<Option> };
		title?: string;
		ariaLabel?: string;
		select: ReturnType<typeof createSelect<SvelteGeneric>>;
	}

	const { options, title = '', ariaLabel = title, select }: Props = $props();

	const {
		elements: { trigger, menu, option, group, groupLabel },
		states: { open, selected },
		helpers: { isSelected },
	} = $derived(select);
</script>

<button
	class="btn w-full min-w-64 justify-between border border-accent-7 hover:border-accent-8 focus:border-accent-9"
	use:melt={$trigger}
	aria-label={ariaLabel}
>
	<div class="flex gap-2">
		{title}
		{$selected?.label ?? $selected?.value}
	</div>

	<I.ChevronDown class="h-4 w-4" />
</button>

{#if $open}
	<div
		class="rounded-lg z-10 flex max-h-[300px] flex-col overflow-y-auto bg-gray-2 p-1 shadow-2 focus:!ring-0"
		use:melt={$menu}
	>
		{#each Object.entries(options) as [key, arr]}
			{@const noKey = key === 'default'}
			<div use:melt={$group(key)}>
				{#if !noKey}
					<div class="py-1 pl-4 pr-4 font-semibold capitalize" use:melt={$groupLabel(key)}>
						{key}
					</div>
				{/if}
				{#each arr as { label, value }}
					{@const selected = $isSelected(value)}
					<div
						class="{noKey ? 'pl-4' : 'pl-8'}
                    relative cursor-pointer py-1 pr-4 focus:z-10 data-[disabled]:opacity-50
                    {selected ? 'bg-accent-9 text-accent-9-contrast' : 'data-[highlighted]:bg-accent-5'}
                    "
						use:melt={$option({ value, label })}
					>
						<div class="check {selected ? 'block' : 'hidden'} {noKey ? 'right' : 'left'}">
							<I.Check class="h-4 w-4" />
						</div>
						{label ?? value}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style lang="postcss">
	.check {
		position: absolute;
		top: 50%;
		z-index: theme(zIndex.20);
		translate: 0 calc(-50% + 1px);
	}
	.check.left {
		left: theme(spacing.2);
	}
	.check.right {
		right: theme(spacing.2);
	}
</style>
