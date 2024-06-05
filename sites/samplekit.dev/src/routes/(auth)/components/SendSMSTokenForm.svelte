<script lang="ts">
	import { InputMessage } from '$lib/components';
	import { Check, Loader2 } from '$lib/styles/icons';
	import { superForm, type SuperValidated } from '$lib/superforms/client';
	import type { sendSMSTokenSchema } from '$routes/(auth)/validators';

	export let sendSMSTokenForm: SuperValidated<typeof sendSMSTokenSchema>;

	const { enhance, message, submitting, delayed } = superForm(sendSMSTokenForm, { taintedMessage: null });

	$: sent = !!$message?.success;
</script>

<form action="/mfa/sms?/sendSMSVeri" method="post" use:enhance>
	<button class="btn btn-hollow h-10 py-0" disabled={$submitting || sent} type="submit">
		{#if sent}
			<Check class="inline h-5 w-5 text-success-7/40" />
			<span>Sent</span>
		{:else if $delayed}
			<Loader2 class="inline h-5 w-5 animate-spin" />
			<span>Send</span>
		{:else}
			Send Text
		{/if}
	</button>

	<InputMessage failOnly {message} />
</form>
