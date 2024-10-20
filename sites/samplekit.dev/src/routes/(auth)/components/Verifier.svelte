<script lang="ts" module>
	import type { SuperValidated } from '$lib/superforms/client';
	import type { confirmPassSchema, sendSMSTokenSchema, verifyOTPSchema } from '$routes/(auth)/schemas';

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
	import { actionsMap } from '$routes/(auth)/actionsMap';
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
		<VerifyEmailForm email={veri.email} action={actionsMap.sendSeshConfToken(veri.next)} />
	{:else if veri.kind === 'Password'}
		<VerifyPWForm
			email={veri.email}
			confirmPassForm={veri.pass.confirmPassForm}
			action={actionsMap.seshConfFromPassword(veri.next)}
		/>
	{:else if veri.kind === 'Identity'}
		<VerifyMFAForm
			mfa={veri.mfa}
			verifySMSTokenAction={actionsMap.seshConfFromSMS(veri.next)}
			verifyAuthenticatorTokenAction={actionsMap.seshConfFromAuthenticator(veri.next)}
			passkeyAction="confirmUser"
			onPasskeyFinished={() => location.reload()}
		/>
	{/if}
</div>
