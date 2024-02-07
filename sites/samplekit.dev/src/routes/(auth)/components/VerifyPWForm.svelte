<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { confirmPassSchema } from '$routes/(auth)/validators';
	import PassInput from './PassInput.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let confirmPassForm: SuperValidated<typeof confirmPassSchema>;
	export let action: string;
	export let email: string;
	export let disabled = false;

	const { form, errors, enhance, message, submitting } = superForm(confirmPassForm, {
		taintedMessage: null,
		validators: confirmPassSchema,
	});

	$: disabled = $submitting;
</script>

<form {action} method="post" use:enhance>
	<input class="hidden" name="email" type="email" autocomplete="username" value={email} />

	<label for="password" class="input-label">Password</label>
	<PassInput
		value={$form.password}
		onChange={(e) => ($form.password = e.currentTarget.value)}
		name_id="password"
		invalid={!!$errors.password}
		autocomplete="current-password"
		disabled={$submitting}
		required
		attrs={undefined}
	/>
	<div class="input-subtext text-error-9">{$errors.password ?? $message?.fail ?? ''}</div>

	<slot name="buttons">
		<div class="mt-4 flex gap-4">
			<button type="button" class="btn btn-hollow" on:click={() => history.back()}>Cancel</button>
			<button type="submit" class="btn btn-accent" disabled={$submitting}>
				{#if $submitting}
					<Loader2 class="inline h-5 w-5 animate-spin" />
					Verifying...
				{:else}
					Verify
				{/if}
			</button>
		</div>
	</slot>

	<slot />
</form>
