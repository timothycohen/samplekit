<script lang="ts">
	import { useCollapsedService } from '$lib/components/collapsedService';
	import { ChevronUp } from '$lib/styles/icons';
	import Copy from './Copy.svelte';

	export let title: string;
	export let copyable = true;
	export let initialCollapsed = false;

	const collapsible = !!$$slots.default;
	let collapsed = collapsible ? initialCollapsed : false;
	$: showCopy = collapsed ? false : copyable;

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
	<span class="bg-gray-3 rounded-tl-card overflow-auto whitespace-nowrap px-4 py-2">{title}</span>
	<div class="flex">
		{#if showCopy}
			<span
				class="{collapsible ? '' : 'rounded-tr-card'} text-gray-10 border-gray-9
				dark:border-gray-5 bg-gray-3 hover:bg-gray-4 min-h-10 w-10 border-l -outline-offset-1"
			>
				<Copy {getTextContent} />
			</span>
		{/if}
		{#if collapsible}
			<button
				on:click={() => (collapsed = !collapsed)}
				class="text-gray-10 bg-gray-3 hover:bg-gray-4 rounded-tr-card grid min-h-10 w-10 place-content-center -outline-offset-1"
			>
				<div class="transition-transform {collapsed ? 'rotate-180' : ''}">
					<ChevronUp />
				</div>
			</button>
		{/if}
	</div>
</div>

{#if !collapsed}
	<slot />
{/if}
