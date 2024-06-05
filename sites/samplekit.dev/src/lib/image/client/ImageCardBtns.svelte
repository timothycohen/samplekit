<script lang="ts">
	import { BadgeCheck, ImagePlus, Loader, Trash2, XCircle } from '$lib/styles/icons';

	interface Props {
		disabled?: boolean,
		loader?: boolean,
		badgeCheck?: boolean,
		onNew?: (() => void) | undefined,
		onCancel?: (() => void) | undefined,
		onDelete?: (() => void) | undefined,
		debug?: string | undefined
	}

	let {
		disabled = false,
		loader = false,
		badgeCheck = false,
		onNew = undefined,
		onCancel = undefined,
		onDelete = undefined,
		debug = undefined
	}: Props = $props();
</script>

{#if onCancel || onNew}
	<div class="absolute left-3 top-3 z-10 space-x-3 text-white">
		{#if onCancel}
			<button {disabled} onclick={(event) => {
	event.stopPropagation();

	onCancel?.(event);
}} aria-label="Cancel">
				<XCircle />
			</button>
		{/if}

		{#if onNew}
			<button {disabled} onclick={(event) => {
	event.stopPropagation();

	onNew?.(event);
}} aria-label="New">
				<ImagePlus />
			</button>
		{/if}
	</div>
{/if}

{#if onDelete || loader || badgeCheck}
	<div class="absolute right-3 top-3 z-10 space-x-3 text-white">
		{#if onDelete}
			<button {disabled} onclick={(event) => {
	event.stopPropagation();

	onDelete?.(event);
}} aria-label="Delete">
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
