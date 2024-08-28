<script lang="ts">
	import { InputMessage } from '$lib/components';
	import I from '$lib/icons';
	import { superForm, zodClient, type SuperValidated } from '$lib/superforms/client';
	import { phoneNumberSchema } from '$routes/(auth)/validators';

	interface Props {
		phoneNumberForm: SuperValidated<typeof phoneNumberSchema>;
		action: App.Form.Action;
	}

	const { phoneNumberForm, action }: Props = $props();

	const { form, errors, enhance, submitting, message } = superForm(phoneNumberForm, {
		validators: zodClient(phoneNumberSchema),
	});
</script>

<form {action} method="post" use:enhance>
	<label for="tel" class="input-label">Phone Number</label>
	<input
		bind:value={$form.phone_number}
		name="phone_number"
		type="tel"
		id="tel"
		class="peer input-text w-52"
		class:input-invalid={$errors.phone_number}
		placeholder="Enter your phone number"
		disabled={$submitting}
		required
	/>
	<InputMessage {message} />

	<button type="submit" class="btn btn-accent" disabled={$submitting}>
		{#if $submitting}
			<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
			Sending...
		{:else}
			Send SMS
		{/if}
	</button>
</form>
