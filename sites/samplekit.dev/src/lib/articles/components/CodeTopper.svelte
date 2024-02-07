<script lang="ts">
	import { ChevronUp } from 'lucide-svelte';
	import Copy from './Copy.svelte';

	export let title: string;
	export let copy = true;
	export let collapsed = false;
</script>

<div class="code-topper" style={collapsed ? 'border-bottom-width: 1px; margin: 0 0 1.5rem 0;' : ''}>
	<span class="self-center px-4 py-2">{title}</span>
	<div class="flex">
		{#if copy}
			<span class="flex min-h-10 items-center justify-center {$$slots.default ? 'w-10' : 'w-12'}">
				<Copy />
			</span>
		{/if}
		{#if $$slots.default}
			<button
				on:click={() => (collapsed = !collapsed)}
				class="text-gray-11 rounded-tr-card border-gray-5 grid min-h-10 w-10 place-content-center -outline-offset-1"
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
