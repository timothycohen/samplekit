<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { Icon } from '$lib/components';

	export let submitGoogle = false;
	export let persistent: boolean;
</script>

<form action="/login/google?/passToGoogleOAuth" method="post" on:submit={() => (submitGoogle = true)}>
	<input type="hidden" name="persistent" value={persistent} />
	<button type="submit" class="btn btn-hollow h-10 w-full py-0" disabled={submitGoogle}>
		{#if submitGoogle}
			<Loader2 class="text-accent-9 h-6 w-6 animate-spin" />
		{:else}
			<Icon icon="google" />
		{/if}
		<span>Continue with Google</span>
	</button>
</form>
