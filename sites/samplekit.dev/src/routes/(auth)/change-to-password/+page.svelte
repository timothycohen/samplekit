<script lang="ts">
	import { InputMessage } from '$lib/components';

	export let form;
</script>

<section class="h-screen-nav mx-auto w-full max-w-3xl p-8">
	<div class="rounded-card shadow-3 space-y-8 p-8">
		<div class="mb-2 text-xl font-bold">Enable Password Login</div>

		<p>We will send a password setup link to your email.</p>
		<p>After confirming your email, you will be able to set a password to enable email/password login.</p>

		<div>
			<div class="flex gap-2">
				<button class="btn btn-hollow" on:click={() => history.back()}>Cancel</button>
				<form action="/change-to-password?/changeToEmailPassProvider" method="post">
					<button class="btn btn-accent" disabled={!!form?.fail || !!form?.success}>Send Setup Email</button>
				</form>
			</div>
			<InputMessage {form} />
		</div>
	</div>

	<div class="alert-wrapper alert-wrapper-warning mt-6">
		Creating a password will disable OAuth sign in (e.g. Google).
	</div>
</section>
