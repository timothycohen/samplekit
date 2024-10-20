<script lang="ts">
	import { Admonition } from '$lib/components';
	import I from '$lib/icons';
	import { actionsMap } from '$routes/(auth)/actionsMap';
	import { Verifier } from '$routes/(auth)/components';

	const { data } = $props();

	let confirmedEmail = $state('');
	let submitting = $state(false);
</script>

<section class="mx-auto h-screen-nav w-full max-w-3xl space-y-8 px-2 py-8">
	<h1 class="text-h4">Delete Account</h1>

	<Verifier veri={data.veri} />

	<div class="space-y-8 rounded-card p-8 shadow-3">
		<h2 class="t-base-lg font-medium">Step 2: Confirm</h2>

		<Admonition bold kind="caution" title="Permanently delete your account">
			<ul class="ml-4">
				<li class="list-disc">All data will be removed.</li>
				<li class="list-disc">There is no chance of recovery.</li>
			</ul>
		</Admonition>

		<form
			action={actionsMap.deleteUserWithSeshConf}
			method="post"
			onsubmit={() => (submitting = true)}
			class="w-full sm:w-96"
		>
			<label class="input-label" for="email">Type your email to confirm</label>
			<input
				disabled={!data.veri.verified || submitting}
				type="text"
				name="confirmedEmail"
				bind:value={confirmedEmail}
				class="peer input-text"
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
					<I.LoaderCircle class="h-4 w-4 animate-spin text-accent-9" />
				{/if}
				<small>Permanently Delete</small>
			</button>
		</form>
	</div>
</section>
