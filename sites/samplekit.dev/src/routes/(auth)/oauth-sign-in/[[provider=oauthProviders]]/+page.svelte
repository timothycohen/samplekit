<script lang="ts">
	import { indefiniteArticle } from '$lib/utils/common';

	export let data;
</script>

<section class="h-screen-nav mx-auto w-full max-w-3xl p-8">
	<div class="rounded-card shadow-3 space-y-8 p-8">
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
