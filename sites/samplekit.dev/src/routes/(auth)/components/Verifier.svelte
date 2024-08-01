<script lang="ts" context="module">
	import type { SuperValidated } from '$lib/superforms/client';
	import type { confirmPassSchema, sendSMSTokenSchema, verifyOTPSchema } from '$routes/(auth)/validators';

	export type VerifierProps = {
		email: string;
		next: string;
		verified: boolean;
		kind: 'Email' | 'Password' | 'Identity';
		expirationMsg: string;
		pass: { confirmPassForm: SuperValidated<typeof confirmPassSchema> };
		mfa: {
			mfasEnabled: DB.MFAs.Enabled;
			mfaCount: number;
			sms: {
				phoneNumberLast4?: string;
				sendSMSTokenForm: SuperValidated<typeof sendSMSTokenSchema>;
				verifyOTPForm: SuperValidated<typeof verifyOTPSchema>;
			};
			authenticator: {
				verifyOTPForm: SuperValidated<typeof verifyOTPSchema>;
			};
		};
	};
</script>

<script lang="ts">
	import { Admonition } from '$lib/components';
	import { VerifyEmailForm, VerifyMFAForm, VerifyPWForm } from '$routes/(auth)/components';

	interface Props {
		veri: VerifierProps;
	}

	const { veri }: Props = $props();
</script>

<div class="space-y-8 rounded-card p-8 shadow-3">
	<h2 class="t-base-lg font-medium">
		Step 1: Verify {veri.kind}
	</h2>

	{#if veri.verified}
		<Admonition kind="tip" title={veri.expirationMsg}></Admonition>
	{:else if veri.kind === 'Email'}
		<VerifyEmailForm
			email={veri.email}
			action="/account/verify/email?/sendEmailVeriToSeshConfEmailLink&next={veri.next}"
		/>
	{:else if veri.kind === 'Password'}
		<VerifyPWForm
			email={veri.email}
			confirmPassForm={veri.pass.confirmPassForm}
			action="/account/verify?/seshConfFromPassword&next={veri.next}"
		/>
	{:else if veri.kind === 'Identity'}
		<VerifyMFAForm
			mfa={veri.mfa}
			verifySMSTokenAction="/account/verify?/seshConfFromSMS&next={veri.next}"
			verifyAuthenticatorTokenAction="/account/verify?/seshConfFromAuthenticator&next={veri.next}"
			passkeyAction="confirmUser"
			onPasskeyFinished={() => location.reload()}
		/>
	{/if}
</div>
