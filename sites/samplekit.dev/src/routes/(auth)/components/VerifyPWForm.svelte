<script lang="ts">
	import { Loader2 } from '$lib/styles/icons';
	import { superForm, zodClient, type SuperValidated } from '$lib/superforms/client';
	import { confirmPassSchema } from '$routes/(auth)/validators';
	import PassInput from './PassInput.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		confirmPassForm: SuperValidated<typeof confirmPassSchema>;
		action: App.Form.Action;
		email: string;
		onSubmitting?: (isSubmitting: boolean) => void;
		buttons?: Snippet;
		children?: Snippet;
	}

	const { confirmPassForm, action, email, buttons, children, onSubmitting }: Props = $props();

	const { form, errors, enhance, message, submitting } = superForm(confirmPassForm, {
		validators: zodClient(confirmPassSchema),
	});

	$effect(() => {
		onSubmitting?.($submitting);
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

	{#if buttons}
		{@render buttons()}
	{:else}
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
