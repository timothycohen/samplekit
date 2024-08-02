<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { mfaLabels } from '$lib/auth/client';
	import { Admonition } from '$lib/components';
	import I from '$lib/icons';
	import UpdatePassForm from './UpdatePassForm.svelte';

	const { data } = $props();

	const { method, mfasEnabled, mfaCount } = $derived(data);
	const authMethods = $derived([
		{ AuthIcon: I.Fingerprint, enabled: mfasEnabled.passkeys, next: 'passkeys' as DB.MFAs.Kind },
		{ AuthIcon: I.ShieldEllipsis, enabled: mfasEnabled.authenticator, next: 'authenticator' as DB.MFAs.Kind },
		// { AuthIcon: MessageCircle, enabled: mfasEnabled.sms, next: 'sms' as DB.MFAs.Kind },
	]);

	let signingOut: 'current' | 'all' | false = $state(false);
	let editingPassword = $state(false);

	const {
		elements: {
			portalled: delAccountPortalled,
			overlay: delAccountOverlay,
			content: delAccountContent,
			title: delAccountTitle,
			description: delAccountDescription,
			close: delAccountClose,
			trigger: delAccountTrigger,
		},
		states: { open: delAccountOpen },
	} = createDialog({ forceVisible: true });

	let mfaToDelete: DB.MFAs.Kind | false = $state(false);
	const {
		elements: {
			portalled: delMFAPortalled,
			overlay: delMFAOverlay,
			content: delMFAContent,
			title: delMFATitle,
			description: delMFADescription,
			close: delMFAClose,
			trigger: delMFATrigger,
		},
		states: { open: delMFAOpen },
	} = createDialog({
		forceVisible: true,
		onOpenChange: ({ next }) => {
			if (next === false) mfaToDelete = false;
			return next;
		},
	});
</script>

<section class="space-y-6">
	<h1 class="text-h4">Authentication</h1>

	<div class="space-y-6 rounded-card p-8 shadow-3">
		<div>
			<h2 class="mb-2 font-bold">Email Address</h2>
			<div class="flex justify-between">
				<p>{data.email}</p>
				{#if method === 'oauth'}
					<div class="flex gap-2">
						<I.Google class="h-6 w-6" aria-label="Google" />
						<span>Linked</span>
					</div>
				{/if}
			</div>
		</div>

		<div>
			<div class="flex justify-between">
				<h2 class="mb-2 font-bold">Password</h2>
				{#if editingPassword}
					<button onclick={() => (editingPassword = false)}><I.Eraser class="h-4 w-4" /></button>
					<small class="sr-only">Open Password Editor</small>
				{:else if method === 'pass'}
					<button onclick={() => (editingPassword = true)}><I.Pencil class="h-4 w-4" /></button>
					<small class="sr-only">Close Password Editor</small>
				{/if}
			</div>

			{#if method === 'oauth'}
				<p>Disabled</p>
			{:else}
				<p>········ Enabled</p>
			{/if}
			{#if editingPassword}
				<div transition:slide class="max-w-xs py-4">
					<UpdatePassForm
						email={data.email}
						updatePassForm={data.updatePassForm}
						onCancel={() => (editingPassword = false)}
						onSuccess={() => setTimeout(() => (editingPassword = false), 1000)}
					/>
				</div>
			{/if}
		</div>

		{#if method === 'oauth'}
			<a href="/change-to-password" class="btn btn-hollow gap-2 text-sm sm:w-fit">
				<I.KeySquare class="h-4 w-4" />
				<span>Enable Password</span>
			</a>
		{:else if mfaCount === 0}
			<a href="/change-to-google" class="btn btn-hollow gap-2 text-sm sm:w-fit">
				<I.Google class="h-4 w-4" />
				<span>Link Google</span>
			</a>
		{/if}
	</div>

	{#if method === 'oauth'}
		<Admonition kind="hint" title="MFA Managed by Google">
			<p class="mb-2">
				Your login and MFA settings are managed by Google. To change your MFA settings, visit your Google Account.
			</p>
			<p>
				If you prefer password authentication, unlink your Google Account to create a password and set up optional MFA.
			</p>
		</Admonition>
	{/if}

	<div class="space-y-6 rounded-card p-8 shadow-3">
		<div>
			<h2 class="mb-2 font-bold">Multi-Factor Authentication (MFA)</h2>
			<p class="text-sm font-light">
				{#if method === 'oauth'}
					<strong>Disabled.</strong> Unlink your Google Account to use MFA.
				{:else if mfaCount < 2}
					Tip: Enable two MFA methods to avoid lock-out if you lose access to your first.
				{/if}
			</p>
		</div>

		<ul class="grid gap-4 lg:grid-cols-2">
			{#each authMethods as { AuthIcon, enabled, next }}
				<li class="flex h-16 w-80 items-center justify-between rounded-btn px-4 shadow-3">
					<AuthIcon />
					<span class="flex-1 pl-4">{mfaLabels[next]}</span>
					<div class="flex items-center justify-around gap-2">
						{#if enabled}
							<span class="contents">
								{#if next === 'sms'}
									<small class="block sm:hidden">●●●-{data.phoneNumberLast4}</small>
									<small class="hidden sm:block">(●●●) ●●●-{data.phoneNumberLast4}</small>
								{/if}
								<div class="rounded-badge bg-success-4/40 text-success-12">
									<I.Check class="p-1" />
								</div>
								<a
									href="/mfa/update?next=remove-{next}"
									{...mfaCount === 1 ? $delMFATrigger : {}}
									onclick={(e) => {
										if (mfaCount === 1) {
											e.preventDefault();
											mfaToDelete = next;
											delMFAOpen.set(true);
										}
									}}
									class:btn-disabled={method === 'oauth'}
									class="btn btn-hollow rounded-badge p-1"
								>
									<I.Trash2 class="h-4 w-4" />
								</a>
							</span>
						{:else if method === 'pass'}
							<a href="/mfa/update?next=register-{next}" class="btn btn-hollow w-[58px] rounded-badge p-2 text-xs">
								Enable
							</a>
						{:else}
							<button disabled class="btn btn-hollow w-[58px] rounded-badge p-2 text-xs">Enable</button>
						{/if}
					</div>
				</li>
			{/each}
		</ul>

		<div>
			<p class="text-sm font-light">MFA enhances your security in the scenario when someone obtains your password.</p>
		</div>
	</div>

	{#if method !== 'oauth'}
		<Admonition kind="hint" title="Prefer Google Sign In?">
			<p class="mb-2">Remove existing MFA methods and an option will appear to link with Google Authentication.</p>
			<p>Password authentication will be disabled and Google will handle your MFA.</p>
		</Admonition>
	{/if}

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-[2fr,_1fr]">
		<div class="flex flex-wrap justify-between gap-4 sm:justify-start">
			<form action="/logout?/logoutCurrent" method="post" onsubmit={() => (signingOut = 'current')}>
				<button disabled={!!signingOut} type="submit" class="btn btn-accent">
					<small>{signingOut === 'current' ? 'Signing out...' : 'Sign out'}</small>
				</button>
			</form>

			<form action="/logout?/logoutAll" method="post" onsubmit={() => (signingOut = 'all')}>
				<button disabled={!!signingOut} type="submit" class="btn btn-hollow">
					<small>{signingOut === 'current' ? 'Signing out of all devices...' : 'Sign out of all devices'}</small>
				</button>
			</form>
		</div>

		<div class="flex justify-end">
			<button type="button" class="btn btn-hollow" use:melt={$delAccountTrigger}>
				<small>Delete account</small>
			</button>
		</div>
	</div>
</section>

{#if mfaCount === 1}
	<div use:melt={$delMFAPortalled}>
		{#if $delMFAOpen}
			<div class="modal-overlay" use:melt={$delMFAOverlay}></div>
			<div class="modal-content" use:melt={$delMFAContent}>
				<h2 class="modal-title" use:melt={$delMFATitle}>Delete MFA Method</h2>
				<p class="modal-description" use:melt={$delMFADescription}>
					You'll be prompted for authentication on the next screen.
				</p>

				<Admonition bold kind="caution" title="Final MFA Method">
					<p class="mb-2">This will remove your final MFA method.</p>
					<p>Keep two MFA methods enabled to fully secure your account.</p>
				</Admonition>

				<div class="modal-btns-wrapper">
					<button class="btn btn-hollow" use:melt={$delMFAClose}>Cancel</button>
					<button onclick={() => goto(`/mfa/update?next=remove-${mfaToDelete}`)} class="btn btn-error">
						Continue
					</button>
				</div>
			</div>
		{/if}
	</div>
{/if}

<div use:melt={$delAccountPortalled}>
	{#if $delAccountOpen}
		<div class="modal-overlay" use:melt={$delAccountOverlay}></div>
		<div class="modal-content" use:melt={$delAccountContent}>
			<h2 class="modal-title" use:melt={$delAccountTitle}>Delete Account</h2>
			<p class="modal-description" use:melt={$delAccountDescription}>
				You'll be prompted for authentication on the next screen.
			</p>

			<Admonition bold kind="caution">
				<div class="text-gray-11">
					<div>Delete <strong class="text-gray-12">{data.email}</strong>?</div>
					<div>There is no going back. Please be certain.</div>
				</div>
			</Admonition>

			<div class="modal-btns-wrapper">
				<button onclick={() => goto('/account/delete')} class="btn btn-hollow text-sm">
					I want to delete my account
				</button>
			</div>

			<button class="modal-x-btn" use:melt={$delAccountClose}><I.X /></button>
		</div>
	{/if}
</div>
