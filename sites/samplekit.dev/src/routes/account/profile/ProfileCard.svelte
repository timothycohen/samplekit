<script lang="ts">
	import { Eraser, Loader2, Pencil } from 'lucide-svelte';
	import { slide } from 'svelte/transition';
	import { superForm } from 'sveltekit-superforms/client';
	import { Avatar } from '$lib/components';
	import { nameSchema } from '$routes/(auth)/validators';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let user: DB.User;
	export let nameForm: SuperValidated<typeof nameSchema>;
	export let editingAvatar = false;
	export let onEditorClicked: (() => void) | undefined = undefined;

	const { form, errors, constraints, enhance, message, submitting, tainted } = superForm(nameForm, {
		validators: nameSchema,
	});

	let editing = false;

	$: noChanges = user.givenName === $form.given_name && user.familyName === $form.family_name;
	$: if (user.givenName || user.familyName) editing = false; // close form after server resolves new user data
	$: if (!editing && $tainted) {
		$tainted.family_name = false;
		$tainted.given_name = false;
	}
</script>

<div class="rounded-card shadow-4 mx-auto max-w-sm p-8 md:mx-0">
	<div class="relative mx-auto w-36 rounded-full">
		<Avatar editing={editingAvatar} avatar={user.avatar} size={150} editable {onEditorClicked} />
	</div>
	<div class="my-4 text-center text-xl font-bold leading-8">
		{#if editing}
			{$form.given_name}
			{$form.family_name}
			<button disabled={$submitting} on:click={() => (editing = false)}><Eraser class="h-4 w-4" /></button>
		{:else}
			{user.givenName}
			{user.familyName}
			<button disabled={$submitting} on:click={() => (editing = true)}><Pencil class="h-4 w-4" /></button>
		{/if}
	</div>

	{#if editing}
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
	<div class="flex flex-wrap items-center justify-between px-3 text-sm">
		<span>Joined On</span>
		<span>{user.joinedOn.toLocaleDateString()}</span>
	</div>
</div>
