<script lang="ts">
	import { VerifyCodeForm } from '$routes/(auth)/components';

	export let data;
</script>

<div class="rounded-card shadow-3 space-y-8 p-8">
	<h2 class="t-base-lg font-medium">Step 2: Add To Authenticator App</h2>
	<div class="alert-wrapper alert-wrapper-info">
		<p class="alert-header">Scan our QR Code</p>
		<p>Tap the "+" icon on your authenticator app (e.g. Google Authenticator) to scan our QR code.</p>
	</div>

	<img alt="authenticator qr code" src={data.authenticator.dataUrl} />

	<div>
		<p><strong>Can't scan?</strong></p>
		<p>Enter the setup key manually.</p>
		<p class="mt-4">Account name</p>
		<p class="text-gray-11">{data.authenticator.account}</p>
		<p class="mt-4">Your key</p>
		<p class="text-gray-11">{data.authenticator.key}</p>
		<p class="mt-4">Type of key</p>
		<p class="text-gray-11">Time based</p>
	</div>
</div>

<div class="rounded-card shadow-3 space-y-8 p-8">
	<h2 class="t-base-lg font-medium">Step 3: Verify Authenticator Code</h2>
	<VerifyCodeForm
		verifyOTPForm={data.authenticator.verifyAuthenticatorTokenForm}
		action="/mfa/update/register/authenticator?/registerMFA_Authenticator_WithSeshConf"
	/>
</div>
