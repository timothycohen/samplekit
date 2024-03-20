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
	import { ChevronUp } from 'lucide-svelte';
	import { useCollapsedService } from '$lib/components/collapsedService';
	import Icon from './Icon.svelte';
	import PatternWrapper from './PatternWrapper.svelte';
	import TabPanelItem from './TabPanelItem.svelte';
	import type { NoPropComponent } from '$lib/utils/common';

	export let files: Array<TabPanel>;

	const {
		elements: { root, list, trigger, content },
		states: { value },
	} = createTabs({
		onValueChange: ({ curr, next }) => {
			if (curr !== next) collapsed = false;
			return next;
		},
	});

	let collapsed = false;

	const service = useCollapsedService();
	if (service) {
		service.onTrigger((newState) => (collapsed = newState));
	}
</script>

<div use:melt={$root}>
	<div
		class="border-gray-9 dark:border-gray-5 bg-gray-3 rounded-t-card flex overflow-hidden border
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
							<span class="group-hover:bg-accent-5 absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full" />
							{#if $value === triggerItem.id}
								<span class="bg-accent-9 absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full" />
							{/if}
						</span>
					</span>
				</button>
			{/each}
		</div>

		<div class="bg-gray-5 flex-1"></div>

		<button
			on:click={() => (collapsed = !collapsed)}
			class="text-gray-10 border-gray-9 dark:border-gray-5 bg-gray-3 hover:bg-gray-4 rounded-tr-card grid min-h-10 w-10 shrink-0 place-content-center border-l -outline-offset-1"
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
