<script lang="ts">
	import { enhance } from '$app/forms';
	import { InputMessage } from '$lib/components';
	import I from '$lib/icons';

	const { form, data } = $props();
</script>

<div class="flex min-h-[80vh] items-center justify-center">
	<div class="relative w-full max-w-md">
		<div class="relative rounded-card px-4 shadow-4">
			<div class="flex-auto p-6">
				<div class="mb-10 flex items-center justify-center overflow-hidden">
					<I.MailCheck class="h-12 w-12 stroke-accent-9" />
				</div>

				<h1 class="mb-2 text-xl font-medium">Verify {data.unverifiedEmail}</h1>
				<p class="mb-10 text-gray-11">Your email verification link was sent to your email.</p>

				<form action="/signup/email-verification?/resendSignupEmailVerification" method="post" use:enhance>
					<button
						class="btn btn-accent h-10 w-full py-0 {form?.success ? 'font-semibold' : ''}"
						disabled={!!form?.success}
						type="submit"
					>
						{form?.success ? 'Sent!' : 'Resend'}
					</button>

					<InputMessage {form} />
				</form>

				<form action="/logout?/logoutCurrent" method="post">
					<button type="submit" class="link">
						<small>Sign in as a different user</small>
					</button>
				</form>
			</div>
		</div>
	</div>
</div>
