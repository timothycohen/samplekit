<script lang="ts">
	import { InputMessage } from '$lib/components';
	import I from '$lib/icons';
	import { superForm, type SuperValidated } from '$lib/superforms/client';
	import type { sendSMSTokenSchema } from '$routes/(auth)/schemas';

	interface Props {
		sendSMSTokenForm: SuperValidated<typeof sendSMSTokenSchema>;
	}

	const { sendSMSTokenForm }: Props = $props();

	const { enhance, message, submitting, delayed } = superForm(sendSMSTokenForm, { taintedMessage: null });

	const sent = $derived(!!$message?.success);
</script>

<form action="/mfa/sms?/sendSMSVeri" method="post" use:enhance>
	<button class="btn btn-hollow h-10 py-0" disabled={$submitting || sent} type="submit">
		{#if sent}
			<I.Check class="inline h-5 w-5 text-success-7/40" />
			<span>Sent</span>
		{:else if $delayed}
			<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
			<span>Send</span>
		{:else}
			Send Text
		{/if}
	</button>

	<InputMessage failOnly {message} />
</form>
