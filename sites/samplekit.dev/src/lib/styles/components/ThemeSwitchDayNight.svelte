<script lang="ts">
	// svg from https://toggles.dev/
	import { clickOn } from '$lib/actions';

	export let modeApplied: 'day' | 'night';
	export let duration = 500;
	export let version: 'horizon' | 'expand' = 'expand';
	export let onModeChange: (scheme: 'fixed_night' | 'fixed_day') => void;

	$: checked = modeApplied === 'night';
</script>

<input
	id="theme-switch-btn"
	aria-label="toggle dark mode"
	{checked}
	type="checkbox"
	class="peer sr-only"
	on:change={() => onModeChange(modeApplied === 'day' ? 'fixed_night' : 'fixed_day')}
	use:clickOn={['Enter']}
/>

<label
	class="text-sun-moon inline-block h-full w-full cursor-pointer peer-focus-visible:outline color-mode-toggle__{version}"
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
