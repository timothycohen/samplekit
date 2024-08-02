<script lang="ts">
	// svg from https://toggles.dev/
	import { tick, type Snippet } from 'svelte';
	import { clickOutside, keyboard, windowEscape } from '$lib/actions';
	import I from '$lib/icons';

	interface Props {
		modeApplied: 'day' | 'night';
		schemeSystem: 'dark' | 'light';
		mode: 'fixed_night' | 'fixed_day' | 'sync_system';
		duration?: number;
		version?: 'horizon' | 'expand';
		onModeChange: (scheme: 'fixed_night' | 'fixed_day' | 'sync_system') => void;
		dayName?: string | undefined;
		nightName?: string | undefined;
		afterMenu?: Snippet<[{ prev: (e: KeyboardEvent) => void; next: (e: KeyboardEvent) => void }]>;
	}

	const {
		modeApplied,
		schemeSystem,
		mode,
		duration = 500,
		version = 'expand',
		onModeChange,
		dayName = undefined,
		nightName = undefined,
		afterMenu,
	}: Props = $props();

	const checked = $derived(modeApplied === 'night');

	let dropdownShown = $state(false);

	const slotUsed = !!afterMenu;

	const showDropdown = (e: Event, focus?: 'focus') => {
		e.preventDefault();
		dropdownShown = true;
		if (focus) tick().then(() => firstEl?.focus());
	};
	const toggleDropdown = (e: Event, focus?: 'focus') => {
		e.preventDefault();
		dropdownShown = !dropdownShown;
		if (dropdownShown && focus) tick().then(() => firstEl?.focus());
	};
	const closeDropdown = () => {
		dropdownShown = false;
	};
	const change = (scheme: 'fixed_night' | 'fixed_day' | 'sync_system') => {
		onModeChange(scheme);
		dropdownShown = false;
		toggleEl.focus();
	};

	let wrapperEl: HTMLDivElement;
	let toggleEl: HTMLInputElement;
	let firstEl: undefined | HTMLButtonElement = $state();

	const next = (e: KeyboardEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLElement)) return;
		const next = e.currentTarget.nextElementSibling;
		if (next instanceof HTMLElement) next.focus();
		else {
			const first = e.currentTarget.parentElement?.firstElementChild;
			if (first instanceof HTMLElement) first.focus();
		}
	};
	const prev = (e: KeyboardEvent) => {
		e.preventDefault();
		if (!(e.currentTarget instanceof HTMLElement)) return;
		const prev = e.currentTarget.previousElementSibling;
		if (prev instanceof HTMLElement) prev.focus();
		else {
			const last = e.currentTarget.parentElement?.lastElementChild;
			if (last instanceof HTMLElement) last.focus();
		}
	};
</script>

<div
	class="relative"
	bind:this={wrapperEl}
	onfocusout={(e) => {
		if (!(e.relatedTarget instanceof Node) || wrapperEl.contains(e.relatedTarget)) return;
		closeDropdown();
	}}
	use:clickOutside={{ onOutclick: closeDropdown }}
	use:windowEscape={closeDropdown}
>
	<input
		id="theme-switch-btn"
		aria-label="toggle dark mode"
		{checked}
		type="checkbox"
		class="peer sr-only"
		bind:this={toggleEl}
		onclick={toggleDropdown}
		use:keyboard={{
			ArrowDown: [(e) => showDropdown(e, 'focus')],
			Enter: [(e) => toggleDropdown(e, 'focus')],
			Space: [(e) => toggleDropdown(e, 'focus')],
		}}
	/>

	<label
		class="inline-block h-full w-full cursor-pointer text-sun-moon peer-focus-visible:outline color-mode-toggle__{version}"
		style="--duration: {duration}ms;"
		for="theme-switch-btn"
	>
		{#if version === 'horizon'}
			<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 32 32">
				<clipPath id="color-mode-toggle__{version}__mask">
					<path d="M0 0h32v29h-32z" />
				</clipPath>
				<path d="M30.7 29.9H1.3c-.7 0-1.3.5-1.3 1.1 0 .6.6 1 1.3 1h29.3c.7 0 1.3-.5 1.3-1.1.1-.5-.5-1-1.2-1z" />
				<g clip-path="url(#color-mode-toggle__{version}__mask)">
					<path
						d="M16 8.8c-3.4 0-6.1 2.8-6.1 6.1s2.7 6.3 6.1 6.3 6.1-2.8 6.1-6.1-2.7-6.3-6.1-6.3zm13.3 11L26 15l3.3-4.8c.3-.5.1-1.1-.5-1.2l-5.7-1-1-5.7c-.1-.6-.8-.8-1.2-.5L16 5.1l-4.8-3.3c-.5-.4-1.2-.1-1.3.4L8.9 8 3.2 9c-.6.1-.8.8-.5 1.2L6 15l-3.3 4.8c-.3.5-.1 1.1.5 1.2l5.7 1 1 5.7c.1.6.8.8 1.2.5L16 25l4.8 3.3c.5.3 1.1.1 1.2-.5l1-5.7 5.7-1c.7-.1.9-.8.6-1.3zM16 22.5A7.6 7.6 0 0 1 8.3 15c0-4.2 3.5-7.5 7.7-7.5s7.7 3.4 7.7 7.5c0 4.2-3.4 7.5-7.7 7.5z"
					/>
				</g>
			</svg>
		{:else if version === 'expand'}
			<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 32 32">
				<clipPath id="color-mode-toggle__{version}__cutout">
					<path d="M0-11h25a1 1 0 0017 13v30H0Z" />
				</clipPath>
				<g clip-path="url(#color-mode-toggle__{version}__cutout)">
					<circle cx="16" cy="16" r="8.4" />
					<path
						d="M18.3 3.2c0 1.3-1 2.3-2.3 2.3s-2.3-1-2.3-2.3S14.7.9 16 .9s2.3 1 2.3 2.3zm-4.6 25.6c0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3-1 2.3-2.3 2.3-2.3-1-2.3-2.3zm15.1-10.5c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zM3.2 13.7c1.3 0 2.3 1 2.3 2.3s-1 2.3-2.3 2.3S.9 17.3.9 16s1-2.3 2.3-2.3zm5.8-7C9 7.9 7.9 9 6.7 9S4.4 8 4.4 6.7s1-2.3 2.3-2.3S9 5.4 9 6.7zm16.3 21c-1.3 0-2.3-1-2.3-2.3s1-2.3 2.3-2.3 2.3 1 2.3 2.3-1 2.3-2.3 2.3zm2.4-21c0 1.3-1 2.3-2.3 2.3S23 7.9 23 6.7s1-2.3 2.3-2.3 2.4 1 2.4 2.3zM6.7 23C8 23 9 24 9 25.3s-1 2.3-2.3 2.3-2.3-1-2.3-2.3 1-2.3 2.3-2.3z"
					/>
				</g>
			</svg>
		{/if}
	</label>

	{#if dropdownShown}
		<div
			class="absolute right-0 top-8 min-w-[14rem] gap-2 overflow-hidden rounded-card border-gray-6 bg-gray-3 shadow-4"
		>
			<button
				bind:this={firstEl}
				tabindex="-1"
				class="flex w-full items-center gap-3 p-4 outline-1 -outline-offset-1 hover:bg-gray-4 focus-visible:bg-gray-4"
				class:rounded-t-card={true}
				onclick={() => change('fixed_day')}
				use:keyboard={{ ArrowUp: [prev], ArrowDown: [next] }}
			>
				<I.Sun class="h-5" />
				<span class="whitespace-nowrap">
					Day {#if dayName}<span class="capitalize">({dayName})</span>{/if}
				</span>
				{#if mode === 'fixed_day'}
					<I.Check class="ml-auto text-success-9" />
				{/if}
			</button>
			<button
				tabindex="-1"
				class="flex w-full items-center gap-3 p-4 outline-1 -outline-offset-1 hover:bg-gray-4 focus-visible:bg-gray-4"
				onclick={() => change('fixed_night')}
				use:keyboard={{ ArrowUp: [prev], ArrowDown: [next] }}
			>
				<I.Moon class="h-5" />
				<span class="whitespace-nowrap">
					Night {#if nightName}<span class="capitalize">({nightName})</span>{/if}
				</span>
				{#if mode === 'fixed_night'}
					<I.Check class="ml-auto text-success-9" />
				{/if}
			</button>
			<button
				tabindex="-1"
				class="flex w-full items-center gap-3 p-4 outline-1 -outline-offset-1 hover:bg-gray-4 focus-visible:bg-gray-4"
				class:rounded-b-card={!slotUsed}
				onclick={() => change('sync_system')}
				use:keyboard={{ ArrowUp: [prev], ArrowDown: [next] }}
			>
				<I.MonitorSmartphone class="h-5" />
				<span>System {schemeSystem === 'dark' ? ' (Night)' : ' (Day)'}</span>
				{#if mode === 'sync_system'}
					<I.Check class="ml-auto text-success-9" />
				{/if}
			</button>
			{@render afterMenu?.({ prev, next })}
		</div>
	{/if}
</div>

<style lang="postcss">
	@media (prefers-reduced-motion: reduce) {
		* {
			transition: none !important;
		}
	}

	label.color-mode-toggle__horizon g path {
		transition: transform var(--duration) cubic-bezier(0, 0, 0.15, 1);
	}
	input#theme-switch-btn:checked ~ label.color-mode-toggle__horizon svg g path {
		transform: translate3d(0, 50%, 0);
	}

	label.color-mode-toggle__expand circle,
	label.color-mode-toggle__expand g path {
		transform-origin: center;
		transition: transform calc(var(--duration) * 0.65) cubic-bezier(0, 0, 0, 1.25) calc(var(--duration) * 0.35);
	}
	label.color-mode-toggle__expand clipPath path {
		transition-property: transform, d;
		transition-duration: calc(var(--duration) * 0.6);
		transition-timing-function: cubic-bezier(0, 0, 0.5, 1);
	}
	input#theme-switch-btn:checked ~ label.color-mode-toggle__expand svg g circle {
		transform: scale(1.4);
		transition-delay: 0s;
	}
	input#theme-switch-btn:checked ~ label.color-mode-toggle__expand svg g path {
		transform: scale(0.75);
		transition-delay: 0s;
	}
	input#theme-switch-btn:checked ~ label.color-mode-toggle__expand svg :first-child path {
		/* d: path('M-9 3h25a1 1 0 0017 13v30H0Z'); */
		transform: translate3d(-9px, 14px, 0);
		transition-delay: calc(var(--duration) * 0.4);
		transition-timing-function: cubic-bezier(0, 0, 0, 1.25);
	}
	@supports not (d: path('')) {
		input#theme-switch-btn:checked ~ label.color-mode-toggle__expand svg :first-child path {
			transform: translate3d(-9px, 14px, 0);
		}
	}
</style>
