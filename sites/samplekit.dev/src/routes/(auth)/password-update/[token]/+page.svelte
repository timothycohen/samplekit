<script lang="ts">
	import { page } from '$app/stores';
	import { Logo, InputMessage } from '$lib/components';
	import { Loader2 } from '$lib/styles/icons';
	import { superForm, zodClient } from '$lib/superforms/client';
	import { PassInput } from '$routes/(auth)/components';
	import { createNewPassSchema } from '$routes/(auth)/validators';

	const { data } = $props();

	const { form, errors, constraints, enhance, message, submitting } = $state(
		superForm(data.createNewPassForm, {
			validators: zodClient(createNewPassSchema),
		}),
	);
</script>

<div class="flex min-h-[80vh] items-center justify-center">
	<div class="relative w-full max-w-md">
		<div class="relative rounded-card px-4 shadow-4">
			<div class="flex-auto p-6">
				<div class="mb-10 flex items-center justify-center overflow-hidden text-2xl">
					<Logo link />
				</div>

				<h2 class="mb-6 text-xl font-medium">Update Password</h2>

				<form action="/password-update/{$page.params['token']}?/createNewPassFromPwReset" method="post" use:enhance>
					<input class="hidden" name="email" type="email" autocomplete="username" value={data.email} />
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

					<div class="group mb-1 flex items-center justify-end gap-2">
						<input type="checkbox" name="persistent" bind:checked={$form.persistent} id="persistent" />
						<label
							for="persistent"
							class="select-none text-sm font-light decoration-accent-6 underline-offset-2 group-hover:underline"
						>
							Remember me
						</label>
					</div>

					<button class="btn btn-accent h-10 w-full py-0" disabled={$submitting} type="submit">
						{#if $submitting}
							<Loader2 class="inline h-5 w-5 animate-spin" />
							Updating...
						{:else}
							Update Password
						{/if}
					</button>

					<div class="my-2 text-xs">This will log you out of all other devices.</div>
					<InputMessage {message} />
				</form>
			</div>
		</div>
	</div>
</div>
