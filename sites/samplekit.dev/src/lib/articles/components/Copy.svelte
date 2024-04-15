<script lang="ts">
	import { fade } from 'svelte/transition';

	export let getTextContent: () => string | null | undefined;

	let copied = false;

	function copyToClipboard() {
		const textContent = getTextContent?.();
		if (!textContent) return;
		navigator.clipboard.writeText(textContent);
		copied = true;
		setTimeout(() => (copied = false), 1000);
	}
</script>

<!-- lucide-svelte Clipboard -->
<button class="grid h-full w-full place-content-center" on:click={copyToClipboard}>
	<span class="sr-only">{copied ? 'Copied' : 'Copy'}</span>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.25"
		stroke-linecap="round"
		stroke-linejoin="round"
	>
		<rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
		<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
		{#if copied}
			<path
				stroke={copied ? 'hsl(var(--accent-9))' : 'currentColor'}
				class={copied ? '' : 'transition-colors duration-300'}
				out:fade={{ duration: 300 }}
				d="m9 14 2 2 4-4"
			/>
		{/if}
	</svg>
</button>
