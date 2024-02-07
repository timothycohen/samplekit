<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { InputMessage } from '$lib/components';
	import { phoneNumberSchema } from '$routes/(auth)/validators';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let phoneNumberForm: SuperValidated<typeof phoneNumberSchema>;
	export let action: string;

	const { form, errors, enhance, submitting, message } = superForm(phoneNumberForm, {
		taintedMessage: null,
		validators: phoneNumberSchema,
	});
</script>

<form {action} method="post" use:enhance>
	<slot />
	<label for="tel" class="input-label">Phone Number</label>
	<input
		bind:value={$form.phone_number}
		name="phone_number"
		type="tel"
		id="tel"
		class="input-text peer w-52"
		class:input-invalid={$errors.phone_number}
		placeholder="Enter your phone number"
		disabled={$submitting}
		required
	/>
	<InputMessage {message} />

	<button type="submit" class="btn btn-accent" disabled={$submitting}>
		{#if $submitting}
			<Loader2 class="inline h-5 w-5 animate-spin" />
			Sending...
		{:else}
			Send SMS
		{/if}
	</button>
</form>
