<script lang="ts">
	export let link = false;
	export let onAnchorClick: (() => void) | undefined = undefined;
</script>

{#if link}
	<a href="/" on:click={onAnchorClick} aria-label="go to home page" class="font-black tracking-tight text-logo">
		SampleKit
	</a>
{:else}
	<span class="font-black tracking-tight text-logo">SampleKit</span>
{/if}
