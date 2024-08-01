<script lang="ts">
	import { startPasskeyReg } from '@samplekit/auth/client';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Admonition } from '$lib/components/index.js';
	import { registerMFA_Passkey_WithSeshConfAndPasskey } from '$routes/(auth)/mfa/update/register/passkeys.json';

	const { data } = $props();

	let err = $state('');

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
		<Admonition kind="error">
			{err}
		</Admonition>
	{:else}
		<Admonition kind="info">
			Please follow the instructions on your device to complete the authentication process.
		</Admonition>
	{/if}
</div>
