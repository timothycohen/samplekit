<script lang="ts">
	import { page } from '$app/stores';
	import { Trash2, BadgeCheck, Loader2 } from '$lib/styles/icons';

	export let data;

	let submitting: string | false = false;
</script>

<section class="space-y-6">
	<h1 class="text-h4">Remembered Devices</h1>

	{#each data.allSessions as session}
		<div class="rounded-card shadow-3 relative space-y-4 p-8">
			{#if session.current}
				<div class="absolute right-4 top-4">
					<div class="flex items-center justify-center gap-1"><BadgeCheck class="h-4 w-4" />This Device</div>
					{#if !session.persistent}
						<div class="flex justify-end"><small>Single Session</small></div>
					{/if}
				</div>
			{:else}
				<form action="/logout?/logoutSingle" method="post" on:submit={() => (submitting = 'all')}>
					<input type="hidden" value={$page.url.pathname} name="redirect_path" />
					<input type="hidden" value={session.id} name="session_id" />
					<button disabled={!!submitting} type="submit" class="btn-ghost absolute right-4 top-4 border-none">
						{#if submitting === session.id}
							<Loader2 class="animate-spin" />
						{:else}
							<Trash2 />
						{/if}
					</button>
				</form>
			{/if}

			<ul class="grid gap-2 lg:grid-cols-2">
				<li>Operating System: {session.os}</li>
				<!-- <li>Location: {session.location}</li> -->
				<li>Browser: {session.browser}</li>
				<li>Created: {session.created.toLocaleString()}</li>
				<li>IP address: {session.ip}</li>
				<li>Last seen: {session.lastSeen}</li>
			</ul>
		</div>
	{/each}

	<div class="alert-wrapper alert-wrapper-info">
		<p class="alert-header text-lg">How long is a device logged in?</p>
		<p class="mb-2">
			The <span class="italic">“Remember me”</span> option stores a session for {data.expirationDuration}
			without any activity. Logging in extends the duration.
		</p>
		<p class="mb-2">
			Devices logged in without the <span class="italic">“Remember me”</span> option are removed when the browser is quit
			and are not displayed here.
		</p>
		<p>You can log out of a remembered device at any time.</p>
	</div>

	<div class="flex flex-wrap justify-between gap-4">
		<form action="/logout?/logoutCurrent" method="post" on:submit={() => (submitting = 'all')}>
			<button disabled={!!submitting} type="submit" class="btn btn-accent">
				<small>{submitting === 'current' ? 'Signout out...' : 'Sign out'}</small>
			</button>
		</form>

		<form action="/logout?/logoutAll" method="post" on:submit={() => (submitting = 'all')}>
			<button disabled={!!submitting} type="submit" class="btn btn-hollow">
				<small>{submitting === 'current' ? 'Signing out of all devices...' : 'Sign out of all devices'}</small>
			</button>
		</form>
	</div>
</section>
