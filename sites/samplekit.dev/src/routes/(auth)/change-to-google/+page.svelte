<script lang="ts">
	import { Icon } from '$lib/components';
	import { VerifyPWForm } from '$routes/(auth)/components';

	interface Props { data: any, disabled?: boolean }

	let { data, disabled = $bindable(false) }: Props = $props();
</script>

<section class="mx-auto h-screen-nav w-full max-w-3xl space-y-8 p-8">
	{#if data.errMsg}
		<div class="alert-wrapper alert-wrapper-error">
			<p class="alert-header">Error</p>
			<p>{data.errMsg}</p>
		</div>
	{/if}

	<h1 class="mb-2 text-xl font-bold">Link Google Account</h1>

	<div class="alert-wrapper alert-wrapper-warning mt-6">
		<p class="alert-header">Linking your Google account will remove password and MFA login.</p>

		Sign in and multi-factor authentication will be managed by your Google account.
	</div>

	<div class="space-y-8 rounded-card p-8 shadow-3">
		<h2 class="t-base-lg font-medium">Verify Password</h2>

		{#if data.mfaCount}
			<div class="alert-wrapper alert-wrapper-error mt-6">
				<p class="alert-header">MFAs enabled</p>
				<p>Please disable all MFA before proceeding.</p>
			</div>

			<a href="/account/security/auth" class="btn btn-hollow sm:w-fit">Okay</a>
		{:else}
			<VerifyPWForm
				email={data.email}
				confirmPassForm={data.confirmPassForm}
				action="/change-to-google?/passwordToLinkGoogle"
				bind:disabled
			>
				<div slot="buttons" class="flex flex-wrap gap-4">
					<a class="btn btn-hollow sm:w-fit" href="/account/security/auth">Cancel</a>
					<button type="submit" class="btn btn-hollow h-10 w-full py-0 sm:w-fit" {disabled}>
						<Icon icon="google" />
						<span>Continue with Google</span>
					</button>
				</div>
				<div class="mt-4 text-xs">This will log you out of all other devices.</div>
			</VerifyPWForm>
		{/if}
	</div>
</section>
