<script lang="ts">
	import { VerifyMFAForm, LoginAsDiffUserForm } from '$routes/(auth)/components';

	export let data;
</script>

<section class="w-full max-w-3xl space-y-8 self-center p-8 md:p-16">
	<h1 class="text-h4">Welcome {data.email}</h1>

	<div>
		<h2 class="text-gray-12 text-lg font-medium">This account uses multi factor authentication.</h2>
		<p class="text-gray-11">Please select one of your enabled verification methods.</p>
	</div>

	<VerifyMFAForm
		mfa={data}
		verifySMSTokenAction="/login/verify-mfa?/loginWithSMS"
		verifyAuthenticatorTokenAction="/login/verify-mfa?/loginWithAuthenticator"
		passkeyAction="login"
		onPasskeyFinished={() => location.reload()}
	>
		<LoginAsDiffUserForm slot="right-of-header" />
	</VerifyMFAForm>
</section>
