<script lang="ts">
	import { fade } from 'svelte/transition';
	import I from '$lib/icons';
	import { debounce } from '$lib/utils/common';
	import ThemeDemo from './ThemeDemo.svelte';
	import type { ModeApplied, Theme } from '../themeUtils';

	interface Props {
		mode: 'day' | 'night';
		themes: Theme[];
		active: boolean;
		preference: Theme;
		switchToFromInactive?: () => void;
		setTheme: (detail: { kind: ModeApplied; theme: Theme }) => void;
	}

	const { mode, themes, active, preference, switchToFromInactive, setTheme }: Props = $props();

	const Icon = mode === 'day' ? I.Sun : I.Moon;
	let hovered: null | Theme = $state(null);
	const displayTheme = $derived(hovered ?? preference);

	let saved: 'fading-in' | 'saved' | 'fading-out' | null = $state(null);

	const setFadeOutTimer = debounce(() => (saved = 'fading-out'), 1000);

	const save = (theme: Theme) => {
		setTheme({ kind: mode, theme });
		saved = 'fading-in';
	};

	let wantsToShowOppositeScheme = $state(false);
	const hasToShowOppositeScheme = $derived(preference.scheme === (mode === 'day' ? 'dark' : 'light'));
	const showOppositeScheme = $derived(wantsToShowOppositeScheme || hasToShowOppositeScheme);
</script>

<div class="overflow-hidden rounded-card border border-gray-6">
	<div class="grid grid-cols-2 items-center border-b border-b-gray-6 bg-app-bg px-2 py-3">
		<span class="flex items-center gap-2">
			<Icon class="h-5" />
			<span><span class="capitalize">{mode}</span> theme</span>
		</span>

		{#if saved === 'fading-in' || saved === 'saved'}
			<span
				class="contents"
				transition:fade={{ duration: 300 }}
				onintrostart={setFadeOutTimer}
				onoutroend={() => (saved = null)}
			></span>
		{/if}

		{#if !active && switchToFromInactive}
			<span class="flex items-center justify-end gap-2">
				<button
					onclick={switchToFromInactive}
					class="btn btn-ghost -m-1 mr-1 p-1 text-sm transition hover:bg-gray-4 hover:text-gray-12 focus:bg-gray-4
					{saved ? 'text-bold bg-gray-4 text-gray-12' : 'text-gray-10'}"
				>
					Activate
				</button>
			</span>
		{:else if saved === 'fading-in' || saved === 'saved'}
			<span class="flex items-center justify-end gap-2">
				<span class="font-semibold text-gray-12">Saved </span>
				<I.Check class="h-5 !stroke-2 text-success-9" />
			</span>
		{:else if saved === null && active}
			<span in:fade|global class="flex items-center justify-end gap-2">
				<span class="font-semibold text-gray-12">Active </span>
				<I.Check class="h-5 !stroke-2 text-success-9" />
			</span>
		{/if}
	</div>

	<div class="m-4 space-y-4">
		<ThemeDemo {displayTheme} />

		<div class="flex flex-wrap gap-4">
			{#each themes as theme (theme)}
				{@const chosen = preference.name === theme.name && preference.scheme === theme.scheme}
				{#if showOppositeScheme || (theme.scheme === 'light' && mode === 'day') || (theme.scheme === 'dark' && mode === 'night')}
					<div>
						<button
							data-theme={theme.name}
							class="{theme.scheme} flex h-10 w-10 overflow-hidden rounded-badge border border-gray-6"
							onclick={() => save(theme)}
							onmouseenter={() => (hovered = theme)}
							onmouseleave={() => (hovered = null)}
							aria-label={`Choose ${theme.name} theme`}
						>
							<span class="h-full flex-1 bg-app-bg"></span>
							<span class="h-full flex-1 bg-accent-9"></span>
						</button>
						{#if active && chosen}
							<I.Dot class="-mb-8 -mt-2 h-10 w-10 fill-accent-9 stroke-accent-9" />
						{/if}
					</div>
				{/if}
			{/each}
		</div>
		<label class="mt-4 flex items-center justify-end gap-2">
			<input type="checkbox" bind:checked={wantsToShowOppositeScheme} disabled={hasToShowOppositeScheme} />
			<span>Show {mode === 'day' ? 'Dark' : 'Light'} Themes</span>
		</label>
	</div>
</div>
