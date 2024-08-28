<script lang="ts">
	import { page } from '$app/stores';
	import { Admonition } from '$lib/components';
	import { VerifyCodeForm, PhoneInput } from '$routes/(auth)/components';

	const { data } = $props();
</script>

<div class="space-y-8 rounded-card p-8 shadow-3">
	<h2 class="t-base-lg font-medium">Step 2: Enter Phone Number</h2>
	<PhoneInput
		phoneNumberForm={data.sms.phoneNumberForm}
		action="/mfa/update/register/sms?/SMSSetupFromSeshConf&{$page.url.search.slice(1)}"
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
			action="/mfa/update/register/sms?/registerMFA_SMS_WithSeshConfAndSetupSMS"
		/>
	{/if}
</div>
