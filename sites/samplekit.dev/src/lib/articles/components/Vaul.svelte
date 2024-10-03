<script lang="ts">
	import { Drawer } from 'vaul-svelte';
	import I from '$lib/icons';
	import type { Snippet } from 'svelte';

	const { children }: { children: Snippet<[{ closeVaul: () => void }]> } = $props();

	let open = $state(false);
</script>

<Drawer.Root bind:open>
	<Drawer.Trigger class="btn btn-hollow rounded-r-none border-none px-3" title="Open Table of Contents">
		<I.List />
	</Drawer.Trigger>
	<Drawer.Portal>
		<Drawer.Content
			class="fixed bottom-0 left-0 right-0 z-[70] mt-24 flex max-h-[96%] flex-col rounded-t-card bg-accent-1"
		>
			<div class="max-h-[96%] flex-1 overflow-y-auto rounded-t-card p-4">
				<div class="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-5"></div>
				<div class="pl-6 pr-2">
					<Drawer.Title class="sr-only mb-4 font-medium">Table Of Contents</Drawer.Title>
					{@render children({ closeVaul: () => (open = false) })}
				</div>
			</div>
		</Drawer.Content>
		<Drawer.Overlay class="modal-overlay" />
	</Drawer.Portal>
</Drawer.Root>
