<script lang="ts">
	import { indefiniteArticle } from '$lib/utils/common';

	interface Props { data: any }

	let { data }: Props = $props();
</script>

<section class="mx-auto h-screen-nav w-full max-w-3xl p-8">
	<div class="space-y-8 rounded-card p-8 shadow-3">
		<div class="mb-2 text-xl font-bold">Link {data.provider ?? 'OAuth'} Account</div>

		<p>This account does not have {data.provider ?? 'OAuth'} authentication enabled.</p>
		<p>
			If you would like to log in with {data.provider ?? 'a provider'}, please sign in with your password, and change to {data.provider ??
				'OAuth'} in
			<strong>Account Security</strong> settings.
		</p>
		<a href="/login" class="btn btn-hollow sm:w-fit">Log In With Password</a>
	</div>

	<div class="alert-wrapper alert-wrapper-warning mt-6">
		<p class="alert-header">
			Linking {data.provider ? `${indefiniteArticle(data.provider)} ${data.provider} account` : 'an OAuth provider'} will
			remove password and MFA login.
		</p>

		Sign in and multi-factor authentication will be managed by {data.provider ?? 'the provider'}.
	</div>
</section>
