<script lang="ts">
	import { Admonition } from '$lib/components';

	const { form } = $props();
</script>

<section class="mx-auto h-screen-nav w-full max-w-3xl p-8">
	<div class="space-y-8 rounded-card p-8 shadow-3">
		<div class="mb-2 text-xl font-bold">Enable Password Login</div>

		<p>We will send a password setup link to your email.</p>
		<p>After confirming your email, you will be able to set a password to enable email/password login.</p>

		<div>
			<div class="flex gap-2">
				<button class="btn btn-hollow" onclick={() => history.back()}>Cancel</button>
				<form action="/change-to-password?/changeToEmailPassProvider" method="post">
					<button class="btn btn-accent" disabled={!!form?.fail || !!form?.success}>Send Setup Email</button>
				</form>
			</div>

			<div class="input-subtext">
				{#if form}
					{#if form.success}
						<Admonition kind="success" title={form.success} />
					{:else if form.fail}
						<Admonition kind="error" title={form.fail} />
					{/if}
				{/if}
			</div>
		</div>
	</div>
</section>
