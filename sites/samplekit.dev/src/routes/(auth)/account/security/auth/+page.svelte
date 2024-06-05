<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { mfaLabels } from '$lib/auth/client';
	import { Icon } from '$lib/components';
	import {
		Check,
		Eraser,
		Fingerprint,
		// MessageCircle,
		Pencil,
		ShieldEllipsis,
		Trash2,
		KeySquare,
		X,
	} from '$lib/styles/icons';
	import UpdatePassForm from './UpdatePassForm.svelte';

	interface Props { data: any }

	let { data }: Props = $props();

	let { method, mfasEnabled, mfaCount } = $derived(data);
	let authMethods = $derived([
		{ AuthIcon: Fingerprint, enabled: mfasEnabled.passkeys, next: 'passkeys' as DB.MFAs.Kind },
		{ AuthIcon: ShieldEllipsis, enabled: mfasEnabled.authenticator, next: 'authenticator' as DB.MFAs.Kind },
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
						<Icon icon="google" class="h-6 w-6" attrs={{ 'aria-label': 'Google' }} />
						<span>Linked</span>
					</div>
				{/if}
			</div>
		</div>

		<div>
			<div class="flex justify-between">
				<h2 class="mb-2 font-bold">Password</h2>
				{#if editingPassword}
					<button onclick={() => (editingPassword = false)}><Eraser class="h-4 w-4" /></button>
					<small class="sr-only">Open Password Editor</small>
				{:else if method === 'pass'}
					<button onclick={() => (editingPassword = true)}><Pencil class="h-4 w-4" /></button>
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
				<KeySquare class="h-4 w-4" />
				<span>Enable Password</span>
			</a>
		{:else if mfaCount === 0}
			<a href="/change-to-google" class="btn btn-hollow gap-2 text-sm sm:w-fit">
				<Icon icon="google" class="h-4 w-4" />
				<span>Link Google</span>
			</a>
		{/if}
	</div>

	<div class="alert-wrapper alert-wrapper-info">
		{#if method === 'oauth'}
			<p class="alert-header">Your MFA is managed by your Google Account.</p>
			<p class="mb-2">Visit your Google Account to change your MFA settings.</p>
			<p>Or unlink your Google Account to create a password and set up MFA (optional).</p>
		{:else}
			<p class="alert-header">Prefer Google Sign In and MFA?</p>
			<p class="mb-2">Remove existing MFA methods and an option will appear to link with Google Authentication.</p>
			<p>Password authentication will be disabled and Google will handle your MFA.</p>
		{/if}
	</div>

	<div class="space-y-6 rounded-card p-8 shadow-3">
		<div>
			<h2 class="mb-2 font-bold">Multi-Factor Authentication (MFA)</h2>
			<p class="text-sm font-light">
				{#if method === 'oauth'}
					Unlink your Google Account to use MFA.
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
									<Check class="p-1" />
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
									<Trash2 class="h-4 w-4" />
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

				<div class="alert-wrapper alert-wrapper-error">
					<p class="alert-header">
						<strong>Final MFA Method</strong>
					</p>
					<p class="mb-2">This will remove your final MFA method.</p>
					<p>Enable two MFA methods to fully secure your account.</p>
				</div>

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

			<div class="alert-wrapper alert-wrapper-warning">
				<p class="alert-header">
					Delete <strong class="font-extrabold text-accent-9 underline">{data.email}</strong>?
				</p>
				<p>There is no going back. Please be certain.</p>
			</div>

			<div class="modal-btns-wrapper">
				<button onclick={() => goto('/account/delete')} class="btn btn-hollow text-sm">
					I want to delete my account
				</button>
			</div>

			<button class="modal-x-btn" use:melt={$delAccountClose}><X /></button>
		</div>
	{/if}
</div>
