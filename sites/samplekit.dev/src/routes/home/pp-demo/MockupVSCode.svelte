<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, filename }: { children: Snippet; filename: string } = $props();
</script>

<div class="h-full flex-col overflow-hidden rounded-card border border-gray-5 shadow-3">
	<div class="rounded-t-lg relative flex h-10 w-full items-center space-x-1.5 border-b border-gray-6 bg-gray-5 px-4">
		<span class="h-3 w-3 rounded-full bg-red-9/80"></span>
		<span class="h-3 w-3 rounded-full bg-amber-9/80"></span>
		<span class="h-3 w-3 rounded-full bg-green-9/80"></span>
		<span class="absolute inset-0 flex h-full w-full items-center justify-center">
			<div class="rounded-badge border border-gray-7 bg-gray-6 px-4 py-1 text-xs text-gray-11/90 sm:text-sm">
				{filename}
			</div>
		</span>
	</div>
	{@render children()}
</div>
