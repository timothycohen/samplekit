<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { InputMessage } from '$lib/components';
	import { superForm, zodClient, type SuperValidated } from '$lib/superforms/client';
	import { phoneNumberSchema } from '$routes/(auth)/validators';

	export let phoneNumberForm: SuperValidated<typeof phoneNumberSchema>;
	export let action: App.Form.Action;

	const { form, errors, enhance, submitting, message } = superForm(phoneNumberForm, {
		validators: zodClient(phoneNumberSchema),
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
