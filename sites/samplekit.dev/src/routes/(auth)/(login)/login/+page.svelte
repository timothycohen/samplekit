<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { InputMessage } from '$lib/components';
	import I from '$lib/icons';
	import { superForm, zodClient } from '$lib/superforms/client';
	import { GoogleFormButton, Or } from '$routes/(auth)/(login)/components';
	import { PassInput } from '$routes/(auth)/components';
	import { signinSchema } from '$routes/(auth)/validators';
	import { useTurnstileCtx } from '../turnstile.ctx.svelte';

	const { data } = $props();

	const {
		form: signinForm,
		errors: signinErrors,
		constraints: signinConstraints,
		enhance: signinEnhance,
		message: signinMessage,
		submitting: signinSubmitting,
	} = superForm(data.signinForm, { validators: zodClient(signinSchema) });

	const {
		form: resetForm,
		errors: resetErrors,
		constraints: resetConstraints,
		enhance: resetEnhance,
		message: resetMessage,
		submitting: resetSubmitting,
	} = superForm(data.emailPassResetForm, { taintedMessage: null });

	const turnstile = useTurnstileCtx();

	const {
		elements: { overlay, content, title, description, close, trigger },
		states: { open: emailPassModal },
	} = createDialog({ forceVisible: true });

	const inputDisabled = $derived($signinSubmitting || $resetSubmitting);
	const signinDisabled = $derived($signinSubmitting || $resetSubmitting || !turnstile.token);
	const resetDisabled = $derived($signinSubmitting || $resetSubmitting || !turnstile.token || !!$resetMessage?.success);
</script>

<h1 class="text-h4 font-medium">Welcome to SampleKit!</h1>
<p class="text-sm">New here? <a href="/signup" class="link">Create an account.</a></p>
<div class="mb-6"></div>
<GoogleFormButton persistent={$signinForm.persistent} />
<Or />

<form
	action="/login?/loginWithPassword"
	method="post"
	use:signinEnhance
	use:turnstile.addForm={{ name: 'signin', form: signinForm }}
>
	<label for="email" class="input-label">Email</label>
	<input
		bind:value={$signinForm.email}
		name="email"
		type="email"
		id="email"
		class="peer input-text"
		class:input-invalid={$signinErrors.email}
		placeholder="Enter your email"
		autocomplete="username"
		disabled={inputDisabled}
		required
		{...$signinConstraints.email}
	/>
	<div class="input-subtext text-error-9">{$signinErrors.email ?? ''}</div>

	<div class="mt-5 flex justify-between">
		<label class="input-label" for="password">Password</label>
		<button type="button" class="link" use:melt={$trigger}>
			<small>Forgot Password?</small>
		</button>
	</div>

	<PassInput
		value={$signinForm.password}
		onChange={(e) => ($signinForm.password = e.currentTarget.value)}
		name_id="password"
		invalid={!!$signinErrors.password}
		autocomplete="current-password"
		disabled={inputDisabled}
		attrs={$signinConstraints.password}
	/>
	<div class="input-subtext text-error-9">{$signinErrors.password ?? ''}</div>

	<div class="group mb-1 flex items-center justify-end gap-2">
		<input type="checkbox" name="persistent" bind:checked={$signinForm.persistent} id="persistent" />
		<label
			for="persistent"
			class="select-none text-sm font-light decoration-accent-6 underline-offset-2 group-hover:underline"
		>
			Remember me
		</label>
	</div>

	<button class="btn btn-accent h-10 w-full py-0 transition-colors" disabled={signinDisabled} type="submit">
		{#if !turnstile.token}
			Verifying...
		{:else if $signinSubmitting}
			<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
			Signing in...
		{:else}
			Sign in
		{/if}
	</button>

	<InputMessage message={signinMessage} />
</form>

<div>
	{#if $emailPassModal}
		<div use:melt={$overlay} class="modal-overlay"></div>
		<div class="modal-content" use:melt={$content}>
			<form
				action="/password-reset?/emailPassReset"
				method="post"
				use:resetEnhance
				use:turnstile.addForm={{ name: 'reset', form: resetForm }}
			>
				<div class="modal-icon-wrapper">
					<I.KeyRound class="h-full w-full" />
				</div>

				<h2 use:melt={$title} class="modal-title">Reset your password.</h2>
				<p use:melt={$description} class="modal-description">We will email you a password reset link.</p>

				<label for="reset-email" class="input-label">Email</label>
				<input
					bind:value={$resetForm.email}
					name="email"
					type="email"
					id="reset-email"
					class="peer input-text"
					class:input-invalid={$resetErrors.email}
					placeholder="Enter your email"
					autocomplete="username"
					disabled={inputDisabled}
					required
					{...$resetConstraints.email}
				/>
				<InputMessage message={resetMessage} failOnly />

				<button
					class="btn btn-accent h-10 w-full py-0 transition-colors {$resetMessage?.success ? 'font-semibold' : ''}"
					disabled={resetDisabled}
					type="submit"
				>
					{#if !turnstile.token}
						<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
						Verifying...
					{:else if $resetSubmitting}
						<I.LoaderCircle class="inline h-5 w-5 animate-spin" />
						Sending
					{:else if $resetMessage?.success}
						Sent!
					{:else}
						Email Password Reset Link
					{/if}
				</button>
			</form>

			<button use:melt={$close} class="modal-x-btn"><I.X /></button>
		</div>
	{/if}
</div>
