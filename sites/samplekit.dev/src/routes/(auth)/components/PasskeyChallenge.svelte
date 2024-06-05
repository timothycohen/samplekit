<script lang="ts">
	import { startPasskeyAuth } from '@samplekit/auth/client';
	import { onMount } from 'svelte';
	import { assertUnreachable } from '$lib/utils/common';
	import { seshConfFromPasskey } from '$routes/(auth)/account/verify/passkey.json';
	import { loginWithPasskey } from '$routes/(auth)/login/verify-mfa/passkey.json';
	import { getPasskeyAuthOpts } from '$routes/(auth)/mfa/passkey/getAuthOptions.json';

	interface Props { passkeyAction: 'login' | 'confirmUser', onFinished: () => void, onError: (error: string) => void }

	let { passkeyAction, onFinished, onError }: Props = $props();

	onMount(async () => {
		const pipeline = (() => {
			switch (passkeyAction) {
				case 'login':
					return { getOptions: getPasskeyAuthOpts, awaitUser: startPasskeyAuth, callback: loginWithPasskey };
				case 'confirmUser':
					return {
						getOptions: getPasskeyAuthOpts,
						awaitUser: startPasskeyAuth,
						callback: seshConfFromPasskey,
					};
			}
			assertUnreachable(passkeyAction);
		})();

		const { data, error: optsError } = await pipeline.getOptions().send();
		if (optsError) return onError(optsError.message);

		const { data: passkeyData, error: awaitUserErr } = await pipeline.awaitUser(data.opts);
		if (awaitUserErr) return onError(awaitUserErr.message);

		const { error } = await pipeline.callback().send({ passkeyData });
		if (error) return onError(error.message);

		return onFinished();
	});
</script>
