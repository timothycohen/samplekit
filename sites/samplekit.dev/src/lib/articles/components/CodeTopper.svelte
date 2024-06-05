<script lang="ts">
	import { useCollapsedService } from '$lib/components/collapsedService';
	import { ChevronUp } from '$lib/styles/icons';
	import Copy from './Copy.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		copyable?: boolean;
		initialCollapsed?: boolean;
		children?: Snippet;
	}

	const { title, copyable = true, initialCollapsed = false, children }: Props = $props();

	const collapsible = !!children;
	let collapsed = $state(collapsible ? initialCollapsed : false);
	const showCopy = $derived(collapsed ? false : copyable);

	let codeTopperEl: HTMLElement;

	function getTextContent() {
		const codeFragment = codeTopperEl?.nextElementSibling;
		return codeFragment?.textContent;
	}

	const service = useCollapsedService();
	if (service) {
		service.onTrigger((newState) => {
			if (collapsible) collapsed = newState;
		});
	}
</script>

<div
	bind:this={codeTopperEl}
	class="code-topper"
	style={collapsed ? 'border-bottom-width: 1px; margin: 0 0 1.5rem 0;' : ''}
>
	<span class="overflow-auto whitespace-nowrap rounded-tl-card bg-gray-3 px-4 py-2">{title}</span>
	<div class="flex">
		{#if showCopy}
			<span
				class="{collapsible ? '' : 'rounded-tr-card'} min-h-10 w-10
				border-l border-gray-9 bg-gray-3 text-gray-10 -outline-offset-1 hover:bg-gray-4 dark:border-gray-5"
			>
				<Copy {getTextContent} />
			</span>
		{/if}
		{#if collapsible}
			<button
				onclick={() => (collapsed = !collapsed)}
				class="grid min-h-10 w-10 place-content-center rounded-tr-card bg-gray-3 text-gray-10 -outline-offset-1 hover:bg-gray-4"
			>
				<div class="transition-transform {collapsed ? 'rotate-180' : ''}">
					<ChevronUp />
				</div>
			</button>
		{/if}
	</div>
</div>

{#if !collapsed && children}
	{@render children()}
{/if}
