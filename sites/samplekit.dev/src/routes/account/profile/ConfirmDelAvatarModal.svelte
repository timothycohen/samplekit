<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';

	interface Props { open: Writable<boolean>, handleDelete: () => void }

	let { open, handleDelete }: Props = $props();

	const {
		elements: { portalled, overlay, content, title, description, close },
	} = createDialog({ open, forceVisible: true });
</script>

<div use:melt={$portalled}>
	{#if $open}
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
