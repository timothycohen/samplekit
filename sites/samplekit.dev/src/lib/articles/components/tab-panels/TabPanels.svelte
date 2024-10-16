<script lang="ts" module>
	import type { WrapperProps } from '$lib/articles/load';
	import type { NoPropComponent } from '$lib/utils/common';
	import type { Snippet } from 'svelte';

	export type TabPanel = { wrapperProps?: WrapperProps; title: string; icon?: 'svelte' } & (
		| { rawHTML: string | Promise<string>; component?: never; snippet?: never }
		| { rawHTML?: never; component: NoPropComponent | Promise<NoPropComponent>; snippet?: never }
		| { rawHTML?: never; component?: never; snippet: Snippet }
	);
</script>

<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import I from '$lib/icons';
	import PatternWrapper from './PatternWrapper.svelte';
	import TabPanelItem from './TabPanelItem.svelte';
	import { useCollapsedCtx } from './collapsed.ctx.svelte';

	interface Props {
		files: Array<TabPanel>;
	}

	const { files }: Props = $props();

	let collapsed = $state(false);

	const {
		elements: { root, list, trigger, content },
		states: { value },
	} = createTabs({
		onValueChange: ({ curr, next }) => {
			if (curr !== next) collapsed = false;
			return next;
		},
	});

	const globalCollapsed = useCollapsedCtx();
	$effect(() => {
		collapsed = globalCollapsed.true;
	});

	// todo svelte-5 melt-ui hack to get rid of "state_unsafe_mutation" error
	files.forEach((_t, i) => $trigger(`tab-${i}`));
</script>

<div use:melt={$root}>
	<div
		class="flex overflow-hidden rounded-t-card border border-gray-9 bg-gray-3 dark:border-gray-5
		{!collapsed ? 'border-b-0' : ''}"
	>
		<div use:melt={$list} class="flex w-fit overflow-x-auto bg-transparent">
			{#each files.map((t, i) => ({ id: `tab-${i}`, title: t.title, icon: t.icon })) as triggerItem, i}
				{@const active = $value === triggerItem.id}
				<button
					use:melt={$trigger(triggerItem.id)}
					class="group relative flex h-10 flex-1 cursor-pointer select-none items-center justify-center
					rounded-none px-2 font-medium leading-6 -outline-offset-1 focus:relative focus-visible:z-10
					{active ? '' : 'bg-gray-3 hover:bg-gray-4'}
					{i === 0 && !triggerItem.icon ? 'pl-4' : ''}
					{i === 0 ? 'rounded-tl-card' : ''}
					"
				>
					<span
						class="flex items-center gap-2 text-nowrap text-base
						{active ? 'text-gray-12' : 'text-gray-10 group-hover:text-gray-11'}"
					>
						{#if triggerItem.icon === 'svelte'}
							<I.Svelte class="h-5 w-5" />
						{/if}

						<span class="relative">
							{triggerItem.title}
							<span class="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full group-hover:bg-accent-5">
							</span>
							{#if $value === triggerItem.id}
								<span class="absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-accent-9"></span>
							{/if}
						</span>
					</span>
				</button>
			{/each}
		</div>

		<div class="flex-1 bg-gray-5"></div>

		<button
			onclick={() => (collapsed = !collapsed)}
			class="grid min-h-10 w-10 shrink-0 place-content-center rounded-tr-card border-l border-gray-9 bg-gray-3 text-gray-10 -outline-offset-1 hover:bg-gray-4 dark:border-gray-5"
			aria-label={collapsed ? 'Expand' : 'Hide'}
		>
			<div class="transition-transform {collapsed ? 'rotate-180' : ''}">
				<I.ChevronUp />
			</div>
		</button>
	</div>

	{#each files as file, i}
		<div use:melt={$content(`tab-${i}`)} tabindex="-1" class="tabpanel">
			{#if !collapsed}
				{#if file.component}
					<PatternWrapper opts={file.wrapperProps}>
						<TabPanelItem panel={file} />
					</PatternWrapper>
				{:else if file.rawHTML}
					<TabPanelItem panel={file} />
				{:else if file.snippet}
					{@render file.snippet()}
				{/if}
			{/if}
		</div>
	{/each}
</div>
