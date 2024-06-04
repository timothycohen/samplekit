<script lang="ts">
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	import { VerifyCodeForm, PhoneInput } from '$routes/(auth)/components';

	export let data;
</script>

<div class="rounded-card shadow-3 space-y-8 p-8">
	<h2 class="t-base-lg font-medium">Step 2: Enter Phone Number</h2>
	<PhoneInput
		phoneNumberForm={data.sms.phoneNumberForm}
		action="/mfa/update/register/sms?/SMSSetupFromSeshConf&{$page.url.search.slice(1)}"
	/>
	{#if !data.sms.sanitizedPhone}
		<p>A code will be sent to your phone number.</p>
	{:else}
		<div class="alert-wrapper alert-wrapper-success">
			A code was sent to {data.sms.sanitizedPhone}
		</div>
	{/if}
</div>

<div class="rounded-card shadow-3 space-y-8 p-8">
	<h2 class="t-base-lg font-medium">Step 3: Verify SMS Code</h2>
	{#if !data.sms.sanitizedPhone}
		<div class="alert-wrapper alert-wrapper-info">Enter the 6-digit code sent to your phone.</div>
	{:else}
		<VerifyCodeForm
			verifyOTPForm={data.sms.verifySMSTokenForm}
			action="/mfa/update/register/sms?/registerMFA_SMS_WithSeshConfAndSetupSMS"
		/>
	{/if}
</div>
