<script lang="ts">
	import { BadgeCheck, ImagePlus, Loader, Trash2, XCircle } from 'lucide-svelte';

	export let disabled = false;
	export let loader = false;
	export let badgeCheck = false;
	export let onNew: (() => void) | undefined = undefined;
	export let onCancel: (() => void) | undefined = undefined;
	export let onDelete: (() => void) | undefined = undefined;
	export let debug: string | undefined = undefined;
</script>

{#if onCancel || onNew}
	<div class="absolute left-3 top-3 z-10 space-x-3 text-white">
		{#if onCancel}
			<button {disabled} on:click|stopPropagation={onCancel} aria-label="Cancel">
				<XCircle />
			</button>
		{/if}

		{#if onNew}
			<button {disabled} on:click|stopPropagation={onNew} aria-label="New">
				<ImagePlus />
			</button>
		{/if}
	</div>
{/if}

{#if onDelete || loader || badgeCheck}
	<div class="absolute right-3 top-3 z-10 space-x-3 text-white">
		{#if onDelete}
			<button {disabled} on:click|stopPropagation={onDelete} aria-label="Delete">
				<Trash2 />
			</button>
		{/if}

		{#if loader}
			<span aria-label="Loading" class="inline-block">
				<Loader class="animate-spin-slow" aria-label="Loading" />
			</span>
		{/if}

		{#if badgeCheck}
			<span aria-label="Complete" class="inline-block">
				<BadgeCheck class="fill-black-9/30" aria-label="Complete " />
			</span>
		{/if}
	</div>
{/if}

{#if debug}
	<div class="absolute bottom-3 left-3 z-10 space-x-3 text-white">
		<span>
			<div class="bg-black">{debug}</div>
		</span>
	</div>
{/if}
