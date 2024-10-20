<script lang="ts">
	import I from '$lib/icons';
	import { actionsMap } from '$routes/(auth)';

	interface Props {
		submitGoogle?: boolean;
		persistent: boolean;
	}

	const { persistent }: Props = $props();

	let submitGoogle = $state(false);
</script>

<form action={actionsMap.passToGoogleOAuth} method="post" onsubmit={() => (submitGoogle = true)}>
	<input type="hidden" name="persistent" value={persistent} />
	<button type="submit" class="btn btn-hollow h-10 w-full py-0" disabled={submitGoogle}>
		{#if submitGoogle}
			<I.LoaderCircle class="animate-spin text-accent-9" />
		{:else}
			<I.Google />
		{/if}
		<span>Continue with Google</span>
	</button>
</form>
