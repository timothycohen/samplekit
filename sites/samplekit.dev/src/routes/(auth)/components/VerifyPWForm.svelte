<script lang="ts">
	import { run } from 'svelte/legacy';

	import { Loader2 } from '$lib/styles/icons';
	import { superForm, zodClient, type SuperValidated } from '$lib/superforms/client';
	import { confirmPassSchema } from '$routes/(auth)/validators';
	import PassInput from './PassInput.svelte';

	interface Props {
		confirmPassForm: SuperValidated<typeof confirmPassSchema>,
		action: App.Form.Action,
		email: string,
		disabled?: boolean,
		buttons?: import('svelte').Snippet,
		children?: import('svelte').Snippet
	}

	let {
		confirmPassForm,
		action,
		email,
		disabled = $bindable(false),
		buttons,
		children
	}: Props = $props();

	const { form, errors, enhance, message, submitting } = superForm(confirmPassForm, {
		validators: zodClient(confirmPassSchema),
	});

	run(() => {
		disabled = $submitting;
	});
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

	{#if buttons}{@render buttons()}{:else}
		<div class="mt-4 flex gap-4">
			<button type="button" class="btn btn-hollow" onclick={() => history.back()}>Cancel</button>
			<button type="submit" class="btn btn-accent" disabled={$submitting}>
				{#if $submitting}
					<Loader2 class="inline h-5 w-5 animate-spin" />
					Verifying...
				{:else}
					Verify
				{/if}
			</button>
		</div>
	{/if}

	{@render children?.()}
</form>
