<script lang="ts">
	import { Icon } from '$lib/components';
	import { Loader2 } from '$lib/styles/icons';

	export let submitGoogle = false;
	export let persistent: boolean;
</script>

<form action="/login/google?/passToGoogleOAuth" method="post" on:submit={() => (submitGoogle = true)}>
	<input type="hidden" name="persistent" value={persistent} />
	<button type="submit" class="btn btn-hollow h-10 w-full py-0" disabled={submitGoogle}>
		{#if submitGoogle}
			<Loader2 class="h-6 w-6 animate-spin text-accent-9" />
		{:else}
			<Icon icon="google" />
		{/if}
		<span>Continue with Google</span>
	</button>
</form>
