<script lang="ts">
	import { slide } from 'svelte/transition';
	import { Eraser, Loader2, Pencil } from '$lib/styles/icons';
	import { superForm, zodClient } from '$lib/superforms/client';
	import { nameSchema } from '$routes/(auth)/validators';
	import type { SuperValidated } from '$lib/superforms/client';

	export let user: DB.User;
	export let nameForm: SuperValidated<typeof nameSchema>;

	const { form, errors, constraints, enhance, message, submitting, tainted } = superForm(nameForm, {
		taintedMessage: true,
		validators: zodClient(nameSchema),
	});

	let editingName = false;

	$: noChanges = user.givenName === $form.given_name && user.familyName === $form.family_name;
	$: if (user.givenName || user.familyName) editingName = false; // close form after server resolves new user data
	$: if (!editingName && $tainted) {
		$tainted.family_name = false;
		$tainted.given_name = false;
	}
</script>

<div class="my-4 text-center text-xl font-bold leading-8">
	{#if editingName}
		{$form.given_name}
		{$form.family_name}
		<button disabled={$submitting} on:click={() => (editingName = false)}><Eraser class="h-4 w-4" /></button>
	{:else}
		{user.givenName}
		{user.familyName}
		<button disabled={$submitting} on:click={() => (editingName = true)}><Pencil class="h-4 w-4" /></button>
	{/if}
</div>

{#if editingName}
	<form action="/account/profile?/updateName" method="post" use:enhance transition:slide class="pb-10">
		<label for="given_name" class="input-label">First name</label>
		<input
			bind:value={$form.given_name}
			name="given_name"
			type="text"
			id="given_name"
			class="input-text peer"
			class:input-invalid={$errors.given_name}
			placeholder="First name"
			disabled={$submitting}
			required
			{...$constraints.given_name}
		/>
		<div class="input-subtext text-error-9">{$errors.given_name ?? ''}</div>

		<label for="family_name" class="input-label">Last name</label>
		<input
			bind:value={$form.family_name}
			name="family_name"
			type="text"
			id="family_name"
			class="input-text peer"
			class:input-invalid={$errors.family_name}
			placeholder="Last name"
			disabled={$submitting}
			required
			{...$constraints.family_name}
		/>
		<div class="input-subtext text-error-9">{$errors.family_name ?? ''}</div>

		<button class="btn btn-accent w-full" type="submit" disabled={$submitting || noChanges}>
			{#if $submitting}
				<Loader2 class="h-4 w-4 animate-spin" />
				Saving...
			{:else if noChanges}
				Saved
			{:else}
				Save
			{/if}
		</button>
		{#if $message}
			<div class="input-subtext text-error-9">{$message}</div>
		{/if}
	</form>
{/if}
