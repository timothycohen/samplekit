<script lang="ts" context="module">
	import type { WrapperProps } from './PatternWrapper.svelte';

	export type TabPanel = { wrapperProps?: WrapperProps; title: string; icon?: 'svelte' } & (
		| { rawHTML: string | Promise<string>; component?: never }
		| {
				rawHTML?: never;
				component: NoPropComponent | Promise<NoPropComponent>;
		  }
	);
</script>

<script lang="ts">
	import { createTabs, melt } from '@melt-ui/svelte';
	import { useCollapsedService } from '$lib/components/collapsedService';
	import { ChevronUp } from '$lib/styles/icons';
	import Icon from './Icon.svelte';
	import PatternWrapper from './PatternWrapper.svelte';
	import TabPanelItem from './TabPanelItem.svelte';
	import type { NoPropComponent } from '$lib/utils/common';

	interface Props { files: Array<TabPanel> }

	let { files }: Props = $props();

	const {
		elements: { root, list, trigger, content },
		states: { value },
	} = createTabs({
		onValueChange: ({ curr, next }) => {
			if (curr !== next) collapsed = false;
			return next;
		},
	});

	let collapsed = $state(false);

	const service = useCollapsedService();
	if (service) {
		service.onTrigger((newState) => (collapsed = newState));
	}
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
						{#if triggerItem.icon}
							<Icon class="h-5 w-5" icon={triggerItem.icon} />
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
		>
			<div class="transition-transform {collapsed ? 'rotate-180' : ''}">
				<ChevronUp />
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
				{:else}
					<TabPanelItem panel={file} />
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style lang="postcss">
	:global(.tabpanel > .code-wrapper) {
		border-radius: 0 0 var(--radius-card) var(--radius-card);
		margin: 0;
	}
	:global(.tabpanel pre) {
		padding: 1rem 1.5rem;
		font-size: 0.9rem;
	}
</style>
