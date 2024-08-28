<script lang="ts">
	import { Admonition } from '$lib/components';
	import { MFASelector, SendSMSTokenForm, VerifyCodeForm, type VerifierProps } from '$routes/(auth)/components';
	import PasskeyChallenge from './PasskeyChallenge.svelte';

	interface Props {
		mfa: VerifierProps['mfa'];
		passkeyAction: 'login' | 'confirmUser';
		verifySMSTokenAction: App.Form.Action;
		verifyAuthenticatorTokenAction: App.Form.Action;
		onPasskeyFinished: () => void;
		children?: import('svelte').Snippet;
	}

	const {
		mfa,
		passkeyAction,
		verifySMSTokenAction,
		verifyAuthenticatorTokenAction,
		onPasskeyFinished,
		children,
	}: Props = $props();

	let selectedMFAMethod: DB.MFAs.Kind | '' = $state('');
	let passkeyError = $state('');
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
			{@render children?.()}
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
			<Admonition bold kind="caution" title="Error">
				{passkeyError}
			</Admonition>
		{:else}
			<Admonition kind="hint">
				Please follow the instructions on your device to complete the authentication process.
			</Admonition>
		{/if}
	{:else if selectedMFAMethod === 'authenticator'}
		<p class="mb-1">Enter the code in your authenticator app to continue.</p>
		<VerifyCodeForm verifyOTPForm={mfa.authenticator.verifyOTPForm} action={verifyAuthenticatorTokenAction} />
	{/if}
</section>
