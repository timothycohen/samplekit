<script lang="ts">
	import { keyboard } from '$lib/svelte-actions';

	interface Props {
		mobileNavOpen: boolean;
		toggle: () => void;
	}

	const { mobileNavOpen, toggle }: Props = $props();

	// despite mobileNavOpen being reactive, on:click|preventDefault won't update the input:checked css without {#key mobileNavOpen}
	// Instead, just allow the checkbox to update itself because toggle is infallible and therefore input:checked and {mobileNavOpen} should never be out of sync
</script>

<input
	id="mobile-nav-btn"
	checked={mobileNavOpen}
	type="checkbox"
	class="peer sr-only"
	aria-label="toggle navigation menu"
	onclick={toggle}
	use:keyboard={{
		Enter: [
			(e) => {
				e.preventDefault();
				toggle();
			},
		],
		Space: [
			(e) => {
				e.preventDefault();
				toggle();
			},
		],
	}}
/>

<label class="z-50 inline-block h-6 w-6 cursor-pointer peer-focus-visible:outline" for="mobile-nav-btn">
	<span class="sr-only">Open mobile navigation menu</span>
	<span class="flex h-full w-full shrink-0 justify-center overflow-hidden">
		<svg viewBox="35 5 30 30" xmlns="http://www.w3.org/2000/svg">
			<path class="line--1" d="M0 40l28-28c2-2 2-2 7-2h64" />
			<path class="line--2" d="M0 20h99" />
			<path class="line--3" d="M0 0l28 28c2 2 2 2 7 2h64" />
		</svg>
	</span>
</label>

<style lang="postcss">
	.line--1,
	.line--3 {
		--length: 24;
		--total-length: 111.22813415527344;
		--offset: -50.22813415527344;
	}
	.line--2 {
		--length: 24;
		--total-length: 99;
		--offset: -38;
	}
	path {
		fill: none;
		stroke: currentColor;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition:
			all 300ms cubic-bezier(0.645, 0.045, 0.355, 1),
			color 0ms;
		stroke-dasharray: var(--length) var(--total-length);
		stroke-dashoffset: var(--offset);
	}

	@media (prefers-reduced-motion: reduce) {
		path {
			transition: none;
		}
	}

	#mobile-nav-btn:checked ~ label .line--1,
	#mobile-nav-btn:checked ~ label .line--3 {
		--length: 22.627416998;
		--offset: -16.9705627485;
	}
	#mobile-nav-btn:checked ~ label .line--2 {
		--length: 0;
		--offset: -20;
	}
	#mobile-nav-btn:checked ~ label path {
		transform: translateX(30px);
	}
</style>
