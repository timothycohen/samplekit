<script lang="ts">
	import { page } from '$app/stores';
	import { Admonition } from '$lib/components';
	import { actionsMap, VerifyCodeForm, PhoneInput } from '$routes/(auth)';

	const { data } = $props();
</script>

<div class="space-y-8 rounded-card p-8 shadow-3">
	<h2 class="t-base-lg font-medium">Step 2: Enter Phone Number</h2>
	<PhoneInput
		phoneNumberForm={data.sms.phoneNumberForm}
		action={actionsMap.SMSSetupFromSeshConf($page.url.searchParams.get('phone') ?? '')}
	/>
	{#if !data.sms.sanitizedPhone}
		<p>A code will be sent to your phone number.</p>
	{:else}
		<Admonition kind="success" title="A code was sent to {data.sms.sanitizedPhone}" />
	{/if}
</div>

<div class="space-y-8 rounded-card p-8 shadow-3">
	<h2 class="t-base-lg font-medium">Step 3: Verify SMS Code</h2>
	{#if !data.sms.sanitizedPhone}
		<Admonition kind="info" title="">Enter the 6-digit code sent to your phone.</Admonition>
	{:else}
		<VerifyCodeForm
			verifyOTPForm={data.sms.verifySMSTokenForm}
			action={actionsMap.registerMFA_SMS_WithSeshConfAndSetupSMS}
		/>
	{/if}
</div>
