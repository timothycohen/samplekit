<script lang="ts">
	import { mfaLabels } from '$lib/auth/client';

	export let data;

	const mfaKind = data.desiredMFA;
	const action = data.action;
</script>

{#if action === 'register'}
	{#if mfaKind === 'passkeys'}
		<div class="rounded-card shadow-3 space-y-8 p-8">
			<h2 class="t-base-lg font-medium">Step 2: Select Passkey</h2>
			<div class="alert-wrapper alert-wrapper-info">You will be able to choose a device to use as your passkey.</div>
		</div>
	{/if}

	{#if mfaKind === 'authenticator'}
		<div class="rounded-card shadow-3 space-y-8 p-8">
			<h2 class="t-base-lg font-medium">Step 2: Add To Authenticator App</h2>
			<div class="alert-wrapper alert-wrapper-info">A QR Code will be generated for your application.</div>
		</div>

		<div class="rounded-card shadow-3 space-y-8 p-8">
			<h2 class="t-base-lg font-medium">Step 3: Verify Authenticator Code</h2>
			<div class="alert-wrapper alert-wrapper-info">Enter the 6-digit code generated by the app.</div>
		</div>
	{/if}

	{#if mfaKind === 'sms'}
		<div class="rounded-card shadow-3 space-y-8 p-8">
			<h2 class="t-base-lg font-medium">Step 2: Enter Phone Number</h2>
			<div class="alert-wrapper alert-wrapper-info">A code will be sent to your phone number.</div>
		</div>

		<div class="rounded-card shadow-3 space-y-8 p-8">
			<h2 class="t-base-lg font-medium">Step 3: Verify SMS Code</h2>
			<div class="alert-wrapper alert-wrapper-info">Enter the 6-digit code sent to your phone.</div>
		</div>
	{/if}
{/if}

{#if action === 'remove'}
	<div class="rounded-card shadow-3 space-y-8 p-8">
		<h2 class="t-base-lg font-medium">Step 2: Confirm {mfaLabels[mfaKind]} MFA Deletion</h2>
		<button class="btn btn-error" disabled>Confirm</button>
	</div>
{/if}
