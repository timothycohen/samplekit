<script lang="ts">
	import { Check, Loader2 } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { InputMessage } from '$lib/components';
	import type { sendSMSTokenSchema } from '$routes/(auth)/validators';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let sendSMSTokenForm: SuperValidated<typeof sendSMSTokenSchema>;

	const { enhance, message, submitting, delayed } = superForm(sendSMSTokenForm, { taintedMessage: null });

	$: sent = !!$message?.success;
</script>

<form action="/mfa/sms?/sendSMSVeri" method="post" use:enhance>
	<button class="btn btn-hollow h-10 py-0" disabled={$submitting || sent} type="submit">
		{#if sent}
			<Check class="text-success-7/40 inline h-5 w-5" />
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
