<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { X } from '$lib/styles/icons';
	import type { SvelteComponent } from 'svelte';

	export let props: {
		Icon?: SvelteComponent;
		trigger?: {
			classes?: string;
			text: string;
		};
		cancel?: {
			text: string;
			classes?: string;
			handler?: ({ close }: { close: () => void }) => void;
		};
		confirm?: {
			text: string;
			classes?: string;
			handler?: ({ close }: { close: () => void }) => void;
		};
		title?: string;
		description?: string;
	} = {};

	export let dialog = createDialog({ forceVisible: true });

	$: ({
		elements: { portalled, overlay, content, title, description, close: closeEl, trigger },
		states: { open },
	} = dialog);

	const close = () => open.set(false);
</script>

<slot name="trigger">
	{#if props.trigger?.text}
		<button type="button" use:melt={$trigger} class={props.trigger.classes ?? 'btn btn-accent'}>
			{props.trigger.text}
		</button>
	{/if}
</slot>

<div use:melt={$portalled}>
	{#if $open}
		<div use:melt={$overlay} class="modal-overlay"></div>
		<div class="modal-content" use:melt={$content}>
			{#if props.Icon}
				<div class="modal-icon-wrapper">
					<props.Icon class="h-full w-full"></props.Icon>
				</div>
			{/if}

			{#if props.title}
				<h2 use:melt={$title} class="modal-title">{props.title}</h2>
			{/if}

			{#if props.description}
				<p use:melt={$description} class="modal-description">
					{props.description}
				</p>
			{/if}

			<slot />

			{#if props.cancel || props.confirm}
				<div class="modal-btns-wrapper">
					{#if props.cancel}
						{@const { text, classes, handler } = props.cancel}
						<button
							type="button"
							on:click={() => (handler ? handler({ close }) : close())}
							class={classes ?? 'btn btn-hollow'}>{text}</button
						>
					{/if}

					{#if props.confirm}
						{@const { text, classes, handler } = props.confirm}
						<button
							type="button"
							on:click={() => (handler ? handler({ close }) : close())}
							class={classes ?? 'btn btn-accent'}>{text}</button
						>
					{/if}
				</div>
			{/if}

			<button use:melt={$closeEl} aria-label="close" class="modal-x-btn">
				<X />
			</button>
		</div>
	{/if}
</div>
