<script lang="ts">
	import { TabPanels } from '$lib/components';
	import type { TabPanel } from '$lib/components/TabPanels.svelte';
	import type { Demo } from '../schema';

	export let files: Demo | undefined;

	let fullFiles: Array<TabPanel> = [];
	if (files?.renderables) {
		fullFiles = files.renderables.map(({ component, meta }) => ({
			wrapperProps: meta,
			title: meta.title,
			component,
			icon: 'svelte',
		}));
	}
	if (files?.highlightedFiles.length) {
		fullFiles = fullFiles.concat(files.highlightedFiles);
	}
</script>

{#if fullFiles.length}
	<div class="my-4">
		<TabPanels files={fullFiles} />
	</div>
{/if}
