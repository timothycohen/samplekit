<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Check, Moon, Sun } from '$lib/styles/icons';
	import { debounce } from '$lib/utils/common';
	import ThemeDemo from './ThemeDemo.svelte';

	type Theme = { name: string; scheme: 'light' | 'dark' };
	export let mode: 'day' | 'night';
	export let themes: Theme[];
	export let active: boolean;
	export let preference: Theme;
	export let setTheme: (theme: { kind: 'day' | 'night'; theme: Theme }) => void;

	const Icon = mode === 'day' ? Sun : Moon;
	let hovered: null | Theme = null;
	$: displayTheme = hovered ?? preference;

	let saved: 'fading-in' | 'saved' | 'fading-out' | null = null;

	const setFadeOutTimer = debounce(() => (saved = 'fading-out'), 1000);

	const save = (theme: Theme) => {
		setTheme({ kind: mode, theme });
		saved = 'fading-in';
	};

	let showOppositeScheme = false;

	$: if (preference.scheme === (mode === 'day' ? 'dark' : 'light')) {
		showOppositeScheme = true;
	}
</script>

<div class="rounded-card border-gray-6 overflow-hidden border">
	<div class="bg-app-bg border-b-gray-6 grid grid-cols-2 items-center border-b px-2 py-3">
		<span class="flex items-center gap-2">
			<Icon class="h-5" />
			<span><span class="capitalize">{mode}</span> theme</span>
		</span>

		{#if saved === 'fading-in' || saved === 'saved'}
			<span
				transition:fade={{ duration: 300 }}
				on:introstart={setFadeOutTimer}
				on:outroend={() => (saved = null)}
				class="flex items-center justify-end gap-2"
			>
				<span>Saved </span>
				<Check class="text-success-9 h-5" />
			</span>
		{:else if saved === null && active}
			<span in:fade class="flex items-center justify-end gap-2">
				<span>Active </span>
				<Check class="text-success-9 h-5" />
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
						class="{theme.scheme} rounded-badge border-gray-6 flex h-10 w-10 overflow-hidden border"
						on:click={() => save(theme)}
						on:mouseenter={() => (hovered = theme)}
						on:mouseleave={() => (hovered = null)}
					>
						<span class="bg-app-bg h-full flex-1"></span>
						<span class="bg-accent-9 h-full flex-1"></span>
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
