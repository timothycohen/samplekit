<script lang="ts">
	import { InputMessage, CodeInput } from '$lib/components';
	import { Loader2 } from '$lib/styles/icons';
	import { superForm, type SuperValidated } from '$lib/superforms/client';
	import type { verifyOTPSchema } from '$routes/(auth)/validators';

	interface Props { action: App.Form.Action, verifyOTPForm: SuperValidated<typeof verifyOTPSchema>, children?: import('svelte').Snippet }

	let { action, verifyOTPForm, children }: Props = $props();

	const { enhance, message, submitting, delayed } = superForm(verifyOTPForm, { taintedMessage: null });

	let filled = $state(false);
</script>

<form {action} method="post" use:enhance>
	{@render children?.()}
	<CodeInput onChange={({ filled: f }) => (filled = f)} namePrefix="auth" />

	<button type="submit" disabled={!filled || $submitting} class="btn btn-accent mt-5">
		{#if $delayed}
			<Loader2 class="inline h-5 w-5 animate-spin" />
		{/if}
		Verify
	</button>
	<InputMessage {message} />
</form>
