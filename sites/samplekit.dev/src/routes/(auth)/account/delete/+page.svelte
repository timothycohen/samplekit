<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { Verifier } from '$routes/(auth)/components';

	export let data;

	let confirmedEmail = '';
	let submitting = false;
</script>

<section class="h-screen-nav mx-auto w-full max-w-3xl space-y-8 px-2 py-8">
	<h1 class="text-h4">Delete Account</h1>

	<Verifier veri={data.veri} />

	<div class="rounded-card shadow-3 space-y-8 p-8">
		<h2 class="t-base-lg font-medium">Step 2: Confirm</h2>

		<div class="alert-wrapper alert-wrapper-error mt-12">
			<div class="alert-header"><strong>Permanently</strong> delete your account.</div>
			<ul class="ml-4">
				<li class="list-disc">All data will be removed.</li>
				<li class="list-disc">There is no chance of recovery.</li>
			</ul>
		</div>

		<form
			action="/account/delete?/deleteUserWithSeshConf"
			method="post"
			on:submit={() => (submitting = true)}
			class="w-full sm:w-96"
		>
			<label class="input-label" for="email">Type your email to confirm</label>
			<input
				disabled={!data.veri.verified || submitting}
				type="text"
				name="confirmedEmail"
				bind:value={confirmedEmail}
				class="input-text peer"
				placeholder={data.veri.email}
				autocomplete="off"
				required
			/>

			<button
				disabled={!data.veri.verified || submitting || data.veri.email !== confirmedEmail}
				type="submit"
				class="btn btn-hollow mt-6 w-full"
			>
				{#if submitting}
					<Loader2 class="text-accent-9 h-4 w-4 animate-spin" />
				{/if}
				<small>Permanently Delete</small>
			</button>
		</form>
	</div>
</section>
