<script lang="ts">
	import { MFASelector, SendSMSTokenForm, VerifyCodeForm, type VerifierProps } from '$routes/(auth)/components';
	import PasskeyChallenge from './PasskeyChallenge.svelte';

	export let mfa: VerifierProps['mfa'];
	export let passkeyAction: 'login' | 'confirmUser';
	export let verifySMSTokenAction: App.Form.Action;
	export let verifyAuthenticatorTokenAction: App.Form.Action;
	export let onPasskeyFinished: () => void;

	let selectedMFAMethod: DB.MFAs.Kind | '' = '';
	let passkeyError = '';
</script>

<section class="mx-auto max-w-2xl">
	<div class="mb-5">
		<MFASelector
			mfasEnabled={mfa.mfasEnabled}
			{selectedMFAMethod}
			onChange={(kind) => {
				selectedMFAMethod = kind;
				passkeyError = '';
			}}
		>
			<slot />
		</MFASelector>
	</div>

	{#if selectedMFAMethod === 'sms'}
		<div>
			<p class="mb-1">
				Send an authentication code to device ending in <strong>{mfa.sms.phoneNumberLast4}</strong>.
			</p>
			<SendSMSTokenForm sendSMSTokenForm={mfa.sms.sendSMSTokenForm} />

			<p class="mb-1">Enter the code to continue.</p>
			<VerifyCodeForm verifyOTPForm={mfa.sms.verifyOTPForm} action={verifySMSTokenAction} />
		</div>
	{:else if selectedMFAMethod === 'passkeys'}
		<PasskeyChallenge {passkeyAction} onFinished={onPasskeyFinished} onError={(e) => (passkeyError = e)} />
		{#if passkeyError}
			<div class="alert-wrapper alert-wrapper-error">
				{passkeyError}
			</div>
		{:else}
			<div class="alert-wrapper alert-wrapper-info">
				Please follow the instructions on your device to complete the authentication process.
			</div>
		{/if}
	{:else if selectedMFAMethod === 'authenticator'}
		<p class="mb-1">Enter the code in your authenticator app to continue.</p>
		<VerifyCodeForm verifyOTPForm={mfa.authenticator.verifyOTPForm} action={verifyAuthenticatorTokenAction} />
	{/if}
</section>
