<script lang="ts">
	import { Admonition } from '$lib/components';
	import { indefiniteArticle } from '$lib/utils/common';

	const { data } = $props();
</script>

<section class="mx-auto h-screen-nav w-full max-w-3xl p-8">
	<Admonition bold kind="security">
		<div>
			<p>This account does not have {data.provider ?? 'OAuth'} authentication enabled.</p>

			<p class="my-2 text-gray-11">
				If you would like to log in with {data.provider ?? 'a provider'}, please sign in with your password, and change
				to {data.provider ?? 'OAuth'} in <strong class="text-gray-12">Account Security</strong> settings. Your
				multi-factor authentication will be managed by {data.provider ?? 'the provider'}.
			</p>

			<a href="/login" class="btn btn-hollow ml-auto mt-6 sm:w-fit">Log In With Password</a>
		</div>
	</Admonition>

	<Admonition kind="note">
		Linking {data.provider ? `${indefiniteArticle(data.provider)} ${data.provider} account` : 'an OAuth provider'} will remove
		password and MFA login.
	</Admonition>
</section>
