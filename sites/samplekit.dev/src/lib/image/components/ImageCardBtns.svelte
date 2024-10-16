<script lang="ts">
	import I from '$lib/icons';

	interface Props {
		disabled?: boolean;
		loader?: boolean;
		badgeCheck?: boolean;
		onNew?: (() => void) | undefined;
		onCancel?: (() => void) | undefined;
		onDelete?: (() => void) | undefined;
		debug?: string | undefined;
	}

	const {
		disabled = false,
		loader = false,
		badgeCheck = false,
		onNew = undefined,
		onCancel = undefined,
		onDelete = undefined,
		debug = undefined,
	}: Props = $props();
</script>

{#if onCancel || onNew}
	<div class="absolute left-3 top-3 z-10 space-x-3 text-white">
		{#if onCancel}
			<button
				{disabled}
				onclick={(event) => {
					event.stopPropagation();
					onCancel?.();
				}}
				aria-label="Cancel"
			>
				<I.CircleX />
			</button>
		{/if}

		{#if onNew}
			<button
				{disabled}
				onclick={(event) => {
					event.stopPropagation();
					onNew?.();
				}}
				aria-label="New"
			>
				<I.ImagePlus />
			</button>
		{/if}
	</div>
{/if}

{#if onDelete || loader || badgeCheck}
	<div class="absolute right-3 top-3 z-10 space-x-3 text-white">
		{#if onDelete}
			<button
				{disabled}
				onclick={(event) => {
					event.stopPropagation();
					onDelete?.();
				}}
				aria-label="Delete"
			>
				<I.Trash2 />
			</button>
		{/if}

		{#if loader}
			<span aria-label="Loading" class="inline-block">
				<I.Loader class="animate-spin-slow" aria-label="Loading" />
			</span>
		{/if}

		{#if badgeCheck}
			<span aria-label="Complete" class="inline-block">
				<I.BadgeCheck class="fill-black-9/30" aria-label="Complete " />
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
