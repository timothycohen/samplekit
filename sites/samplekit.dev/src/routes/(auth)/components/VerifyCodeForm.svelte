<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { InputMessage, CodeInput } from '$lib/components';
	import { superForm, type SuperValidated } from '$lib/superforms/client';
	import type { verifyOTPSchema } from '$routes/(auth)/validators';

	export let action: App.Form.Action;
	export let verifyOTPForm: SuperValidated<typeof verifyOTPSchema>;

	const { enhance, message, submitting, delayed } = superForm(verifyOTPForm, { taintedMessage: null });

	let filled = false;
</script>

<form {action} method="post" use:enhance>
	<slot />
	<CodeInput onChange={({ filled: f }) => (filled = f)} namePrefix="auth" />

	<button type="submit" disabled={!filled || $submitting} class="btn btn-accent mt-5">
		{#if $delayed}
			<Loader2 class="inline h-5 w-5 animate-spin" />
		{/if}
		Verify
	</button>
	<InputMessage {message} />
</form>
