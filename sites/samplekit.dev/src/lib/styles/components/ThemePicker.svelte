<script lang="ts">
	import { fade } from 'svelte/transition';
	import I from '$lib/icons';
	import { debounce } from '$lib/utils/common';
	import ThemeDemo from './ThemeDemo.svelte';

	type Theme = { name: string; scheme: 'light' | 'dark' };
	interface Props {
		mode: 'day' | 'night';
		themes: Theme[];
		active: boolean;
		preference: Theme;
		setTheme: (theme: { kind: 'day' | 'night'; theme: Theme }) => void;
	}

	const { mode, themes, active, preference, setTheme }: Props = $props();

	const Icon = mode === 'day' ? I.Sun : I.Moon;
	let hovered: null | Theme = $state(null);
	const displayTheme = $derived(hovered ?? preference);

	let saved: 'fading-in' | 'saved' | 'fading-out' | null = $state(null);

	const setFadeOutTimer = debounce(() => (saved = 'fading-out'), 1000);

	const save = (theme: Theme) => {
		setTheme({ kind: mode, theme });
		saved = 'fading-in';
	};

	let showOppositeScheme = $state(false);

	$effect(() => {
		if (preference.scheme === (mode === 'day' ? 'dark' : 'light')) {
			showOppositeScheme = true;
		}
	});
</script>

<div class="overflow-hidden rounded-card border border-gray-6">
	<div class="grid grid-cols-2 items-center border-b border-b-gray-6 bg-app-bg px-2 py-3">
		<span class="flex items-center gap-2">
			<Icon class="h-5" />
			<span><span class="capitalize">{mode}</span> theme</span>
		</span>

		{#if saved === 'fading-in' || saved === 'saved'}
			<span
				transition:fade={{ duration: 300 }}
				onintrostart={setFadeOutTimer}
				onoutroend={() => (saved = null)}
				class="flex items-center justify-end gap-2"
			>
				<span>Saved </span>
				<I.Check class="h-5 text-success-9" />
			</span>
		{:else if saved === null && active}
			<span in:fade|global class="flex items-center justify-end gap-2">
				<span>Active </span>
				<I.Check class="h-5 text-success-9" />
			</span>
		{/if}
	</div>

	<div class="m-4 space-y-4">
		<ThemeDemo {displayTheme} />

		<div class="flex flex-wrap gap-4">
			{#each themes as theme}
				{#if showOppositeScheme || (theme.scheme === 'light' && mode === 'day') || (theme.scheme === 'dark' && mode === 'night')}
					<button
						data-theme={theme.name}
						class:scale-125={theme.name === displayTheme.name && theme.scheme === displayTheme.scheme}
						class="{theme.scheme} flex h-10 w-10 overflow-hidden rounded-badge border border-gray-6"
						onclick={() => save(theme)}
						onmouseenter={() => (hovered = theme)}
						onmouseleave={() => (hovered = null)}
					>
						<span class="h-full flex-1 bg-app-bg"></span>
						<span class="h-full flex-1 bg-accent-9"></span>
					</button>
				{/if}
			{/each}
		</div>
		<label class="mt-4 flex items-center justify-end gap-2">
			<input
				type="checkbox"
				bind:checked={showOppositeScheme}
				disabled={preference.scheme === (mode === 'day' ? 'dark' : 'light')}
			/>
			<span>Show {mode === 'day' ? 'Dark' : 'Light'} Themes</span>
		</label>
	</div>
</div>
