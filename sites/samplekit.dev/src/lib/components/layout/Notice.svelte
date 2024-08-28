<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import I from '$lib/icons';
	import type { Component, Snippet } from 'svelte';

	interface Props {
		Icon?: Component;
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
		children: Snippet;
	}

	const { Icon, cancel, confirm, description, title, trigger, children }: Props = $props();

	const dialog = createDialog({ forceVisible: true });

	const {
		elements: {
			portalled: portalledEl,
			overlay: overlayEl,
			content: contentEl,
			title: titleEl,
			description: descriptionEl,
			close: closeEl,
			trigger: triggerEl,
		},
		states: { open },
	} = dialog;

	const close = () => open.set(false);
</script>

{#if trigger?.text}
	<button type="button" use:melt={$triggerEl} class={trigger.classes ?? 'btn btn-accent'}>
		{trigger.text}
	</button>
{/if}

<div use:melt={$portalledEl}>
	{#if $open}
		<div use:melt={$overlayEl} class="modal-overlay"></div>
		<div class="modal-content" use:melt={$contentEl}>
			{#if Icon}
				<div class="modal-icon-wrapper">
					<Icon class="h-full w-full"></Icon>
				</div>
			{/if}

			{#if title}
				<h2 use:melt={$titleEl} class="modal-title">{title}</h2>
			{/if}

			{#if description}
				<p use:melt={$descriptionEl} class="modal-description">
					{description}
				</p>
			{/if}

			{@render children()}

			{#if cancel || confirm}
				<div class="modal-btns-wrapper">
					{#if cancel}
						{@const { text, classes, handler } = cancel}
						<button
							type="button"
							onclick={() => (handler ? handler({ close }) : close())}
							class={classes ?? 'btn btn-hollow'}>{text}</button
						>
					{/if}

					{#if confirm}
						{@const { text, classes, handler } = confirm}
						<button
							type="button"
							onclick={() => (handler ? handler({ close }) : close())}
							class={classes ?? 'btn btn-accent'}
						>
							{text}
						</button>
					{/if}
				</div>
			{/if}

			<button use:melt={$closeEl} aria-label="close" class="modal-x-btn">
				<I.X />
			</button>
		</div>
	{/if}
</div>
