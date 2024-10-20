<script lang="ts">
	import { onMount } from 'svelte';
	import { auth } from '$lib/auth/client';
	import { loginWithPasskey } from '$routes/(auth)/(login-signup)/login/verify-mfa/passkey.json';
	import { seshConfFromPasskey } from '$routes/(auth)/account/verify/passkey.json';
	import { getPasskeyAuthOpts } from '$routes/(auth)/mfa/passkey/getAuthOptions.json';

	interface Props {
		passkeyAction: 'login' | 'confirmUser';
		onFinished: () => void;
		onError: (error: string) => void;
	}

	const { passkeyAction, onFinished, onError }: Props = $props();

	onMount(async () => {
		const { data, error: optsError } = await getPasskeyAuthOpts.send();
		if (optsError) return onError(optsError.message);

		const { data: passkeyData, error: awaitUserErr } = await auth.passkey.startAuth(data.opts);
		if (awaitUserErr) return onError(awaitUserErr.message);

		const { error } = await (passkeyAction === 'login' ? loginWithPasskey : seshConfFromPasskey).send({ passkeyData });
		if (error) return onError(error.message);

		return onFinished();
	});
</script>
