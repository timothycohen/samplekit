<script lang="ts">
	import { startPasskeyReg } from '@samplekit/auth/client';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { registerMFA_Passkey_WithSeshConfAndPasskey } from '$routes/(auth)/mfa/update/register/passkeys.json';

	export let data;

	let err = '';

	const registeringPasskey = registerMFA_Passkey_WithSeshConfAndPasskey();

	const handlePasskey = async () => {
		const { data: passkeyData, error: startErr } = await startPasskeyReg(data.passkey.opts);
		if (startErr) return (err = startErr.message);

		const { error } = await registeringPasskey.send({ passkeyData });
		if (error) return (err = error.message);

		goto('/account/security/auth');
	};

	onMount(() => {
		handlePasskey();
	});
</script>

<div class="space-y-8 rounded-card p-8 shadow-3">
	<h2 class="t-base-lg font-medium">Step 2: Select Passkey</h2>
	{#if err}
		<div class="alert-wrapper alert-wrapper-error">
			{err}
		</div>
	{:else}
		<div class="alert-wrapper alert-wrapper-info">
			Please follow the instructions on your device to complete the authentication process.
		</div>
	{/if}
</div>
