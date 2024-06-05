<script lang="ts">
	interface Props { link?: boolean, onAnchorClick?: (() => void) | undefined }

	let { link = false, onAnchorClick = undefined }: Props = $props();
</script>

{#if link}
	<a href="/" onclick={onAnchorClick} aria-label="go to home page" class="font-black tracking-tight text-logo">
		SampleKit
	</a>
{:else}
	<span class="font-black tracking-tight text-logo">SampleKit</span>
{/if}
