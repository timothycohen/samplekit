<script lang="ts">
	import { useTurnstileService } from '$lib/botProtection/turnstile/client';
	import { InputMessage } from '$lib/components';
	import { Loader2 } from '$lib/styles/icons';
	import { superForm, zodClient } from '$lib/superforms/client';
	import { GoogleFormButton, Or } from '$routes/(auth)/(login)/components';
	import { PassInput } from '$routes/(auth)/components';
	import { signupSchema } from '$routes/(auth)/validators';

	interface Props { data: any }

	let { data }: Props = $props();

	const { form, errors, constraints, enhance, message, submitting } = $state(superForm(data.signupForm, {
		validators: zodClient(signupSchema),
	}));

	const { turnstile, turnstileInput } = useTurnstileService();
</script>

<h1 class="text-h4 font-medium">Sign up</h1>
<p class="text-sm">Have an account? <a href="/login" class="link">Log in now.</a></p>
<div class="mb-6"></div>
<GoogleFormButton persistent={$form.persistent} />
<Or />

<form action="/signup?/signupWithPassword" method="post" use:enhance use:turnstileInput={{ form }}>
	<label for="email" class="input-label">Email</label>
	<input
		bind:value={$form.email}
		name="email"
		type="email"
		id="email"
		class="peer input-text"
		class:input-invalid={$errors.email}
		placeholder="Enter your email"
		autocomplete="username"
		disabled={$submitting}
		required
		{...$constraints.email}
	/>
	<div class="input-subtext text-error-9">{$errors.email ?? ''}</div>

	<label for="given_name" class="input-label">First name</label>
	<input
		bind:value={$form.given_name}
		name="given_name"
		type="text"
		id="given_name"
		class="peer input-text"
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
		class="peer input-text"
		class:input-invalid={$errors.family_name}
		placeholder="Last name"
		disabled={$submitting}
		required
		{...$constraints.family_name}
	/>
	<div class="input-subtext text-error-9">{$errors.family_name ?? ''}</div>

	<label for="password" class="input-label">Password</label>
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

	<div class="group mb-1 flex items-center justify-end gap-2">
		<input type="checkbox" name="persistent" bind:checked={$form.persistent} id="persistent" />
		<label
			for="persistent"
			class="select-none text-sm font-light decoration-accent-6 underline-offset-2 group-hover:underline"
		>
			Remember me
		</label>
	</div>

	<button class="btn btn-accent h-10 w-full py-0 transition-colors" disabled={$submitting || !$turnstile} type="submit">
		{#if $submitting}
			<Loader2 class="inline h-5 w-5 animate-spin" />
			Creating...
		{:else}
			Sign up
		{/if}
	</button>

	<InputMessage {message} />
</form>
