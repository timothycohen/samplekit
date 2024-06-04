<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import type { Writable } from 'svelte/store';

	export let open: Writable<boolean>;
	export let handleDelete: () => void;

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
				<button class="btn btn-error" on:click={handleDelete}>Delete</button>
			</div>
		</div>
	{/if}
</div>
