<script lang="ts">
	export let link = false;
	export let onAnchorClick: (() => void) | undefined = undefined;
</script>

{#if link}
	<a href="/" on:click={onAnchorClick} aria-label="go to home page" class="text-logo font-black tracking-tight">
		SampleKit
	</a>
{:else}
	<span class="text-logo font-black tracking-tight">SampleKit</span>
{/if}
