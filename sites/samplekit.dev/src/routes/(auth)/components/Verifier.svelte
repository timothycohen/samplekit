<script lang="ts" context="module">
	import type { confirmPassSchema, sendSMSTokenSchema, verifyOTPSchema } from '$routes/(auth)/validators';
	import type { SuperValidated } from 'sveltekit-superforms';

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
	import { VerifyEmailForm, VerifyMFAForm, VerifyPWForm } from '$routes/(auth)/components';

	export let veri: VerifierProps;
</script>

<div class="rounded-card shadow-3 space-y-8 p-8">
	<h2 class="t-base-lg font-medium">
		Step 1: Verify {veri.kind}
	</h2>

	{#if veri.verified}
		<div class="alert-wrapper alert-wrapper-success">
			{veri.expirationMsg}
		</div>
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
