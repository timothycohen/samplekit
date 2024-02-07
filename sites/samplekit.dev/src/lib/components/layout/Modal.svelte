<script lang="ts" context="module">
	import { writable, type Writable } from 'svelte/store';

	type ConfirmationModal = { open: boolean; confirmed?: boolean | null; onCancel?: () => void; onConfirm?: () => void };

	/**
	 * confirmed === undefined -> never presented
	 *
	 * confirmed === null -> currently presenting
	 *
	 * confirmed === false -> canceled
	 *
	 * confirmed === true -> confirmed
	 */
	export const createConfirmationModal = () => {
		// @ts-expect-error SAFETY: confirm references confirmationModal so it is added after the store is created
		const confirmationModal: Writable<ConfirmationModal> & { confirm: () => Promise<boolean> } = writable({
			open: false,
		});

		const confirm = () => {
			return new Promise<boolean>((resolve) => {
				confirmationModal.set({
					open: true,
					confirmed: null,
					onCancel: () => {
						confirmationModal.set({ open: false, confirmed: false });
						resolve(false);
					},
					onConfirm: () => {
						confirmationModal.set({ open: false, confirmed: true });
						resolve(true);
					},
				});
			});
		};

		confirmationModal.confirm = confirm;

		return confirmationModal;
	};
</script>

<script lang="ts">
	import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock-upgrade';
	import { onDestroy } from 'svelte';
	import { trapFocus, windowEscape } from '$lib/actions';

	export let backdropClasses: string | null | undefined = `modal-overlay`;
	export let dialogClasses: string | null | undefined = 'modal-content';

	export let open: boolean;
	let dialog: HTMLSpanElement;

	export let onOutclick: (() => void) | undefined = undefined;
	export let onEscape: (() => void) | undefined = undefined;

	$: if (dialog) {
		open ? disableBodyScroll(dialog, { reserveScrollBarGap: true }) : enableBodyScroll(dialog);
	}

	onDestroy(() => {
		dialog && enableBodyScroll(dialog);
	});
</script>

{#if open}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<div class={backdropClasses} on:click={onOutclick} />

	<span bind:this={dialog} class={dialogClasses} use:windowEscape={onEscape} use:trapFocus>
		<slot />
	</span>
{/if}
