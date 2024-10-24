<script lang="ts">
	import { InputMessage } from '$lib/components';
	import I from '$lib/icons';
	import { superForm, type SuperValidated } from '$lib/superforms/client';
	import { PassInput, actionsMap, type updatePassSchema } from '$routes/(auth)';

	interface Props {
		updatePassForm: SuperValidated<typeof updatePassSchema>;
		email: string;
		onCancel: () => void;
		onSuccess: () => void;
	}

	const { updatePassForm, email, onCancel, onSuccess }: Props = $props();

	const { form, errors, constraints, enhance, message, submitting } = $state(superForm(updatePassForm, {}));

	message.subscribe(($message) => {
		if ($message?.success) onSuccess();
	});
</script>

<form action={actionsMap.updatePassFromCurrPass} method="post" use:enhance>
	<input class="hidden" name="email" type="email" autocomplete="username" value={email} />

	<label for="currentPassword" class="input-label">Current Password</label>
	<PassInput
		value={$form.currentPassword}
		onChange={(e) => ($form.currentPassword = e.currentTarget.value)}
		name_id="currentPassword"
		invalid={!!$errors.currentPassword}
		autocomplete="current-password"
		disabled={$submitting}
		attrs={$constraints.currentPassword}
	/>
	<div class="input-subtext text-error-9">{$errors.currentPassword ?? ''}</div>

	<label for="password" class="input-label">New Password</label>
	<PassInput
		value={$form.password}
		onChange={(e) => ($form.password = e.currentTarget.value)}
		name_id="password"
		invalid={!!$errors.password}
		autocomplete="new-password"
		disabled={$submitting}
		attrs={$constraints.password}
	/>
	<div class="input-subtext text-error-9">
		{#if $errors.password}
			<span class="block">Password must contain:</span>
			<ul>
				{#each $errors.password as error}
					<li class="ml-8 list-disc">{error}</li>
				{/each}
			</ul>
		{/if}
	</div>

	<label for="confirmation" class="input-label">Confirm Password</label>
	<PassInput
		value={$form.confirmation}
		onChange={(e) => ($form.confirmation = e.currentTarget.value)}
		name_id="confirmation"
		invalid={!!$errors.confirmation}
		autocomplete="new-password"
		disabled={$submitting}
		attrs={$constraints.confirmation}
	/>
	<div class="input-subtext text-error-9">{$errors.confirmation ?? ''}</div>

	<div class="flex gap-4">
		<button class="btn btn-hollow flex-grow" type="button" onclick={onCancel}> Cancel </button>

		<button class="btn btn-accent" disabled={$submitting} type="submit">
			{#if $submitting}
				<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
				Updating...
			{:else}
				Update Password
			{/if}
		</button>
	</div>

	<div class="my-2 text-xs">This will log you out of all other devices.</div>
	<InputMessage {message} />
</form>
