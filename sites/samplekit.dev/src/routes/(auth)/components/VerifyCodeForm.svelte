<script lang="ts">
	import { InputMessage, CodeInput } from '$lib/components';
	import I from '$lib/icons';
	import { superForm, type SuperValidated } from '$lib/superforms/client';
	import type { verifyOTPSchema } from '$routes/(auth)/schemas';

	interface Props {
		action: App.Form.Action;
		verifyOTPForm: SuperValidated<typeof verifyOTPSchema>;
	}

	const { action, verifyOTPForm }: Props = $props();

	const { enhance, message, submitting, delayed } = superForm(verifyOTPForm, { taintedMessage: null });

	let filled = $state(false);
</script>

<form {action} method="post" use:enhance>
	<CodeInput onChange={(detail) => (filled = detail.filled)} namePrefix="auth" />

	<button type="submit" disabled={!filled || $submitting} class="btn btn-accent mt-5">
		{#if $delayed}
			<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
		{/if}
		Verify
	</button>
	<InputMessage {message} />
</form>
