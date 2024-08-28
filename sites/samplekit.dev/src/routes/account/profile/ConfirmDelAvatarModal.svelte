<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';

	interface Props {
		open: boolean;
		handleDelete: () => void;
	}

	let { open = $bindable(), handleDelete }: Props = $props();

	const {
		elements: { portalled, overlay, content, title, description, close },
	} = createDialog({
		forceVisible: true,
		defaultOpen: open,
		onOpenChange: ({ next }) => {
			open = next;
			return next;
		},
	});
</script>

<div use:melt={$portalled}>
	{#if open}
		<div class="modal-overlay" use:melt={$overlay}></div>
		<div class="modal-content" use:melt={$content}>
			<h2 class="modal-title" use:melt={$title}>Delete your avatar?</h2>
			<p class="modal-description" use:melt={$description}>This cannot be undone.</p>
			<div class="modal-btns-wrapper">
				<button class="btn btn-hollow" use:melt={$close}>Cancel</button>
				<button class="btn btn-error" onclick={handleDelete}>Delete</button>
			</div>
		</div>
	{/if}
</div>
