<script lang="ts">
	import MobileRoute from './MobileRoute.svelte';
	import type { RouteGroup, RouteLeaf } from './routes';

	interface Props {
		onNavItemClick: () => void;
		routes: Array<RouteLeaf | RouteGroup>;
		position: 'left' | 'center';
		slideBg?: boolean;
		liftIn?: boolean;
		overlayClasses?: string | null | undefined;
	}

	const {
		onNavItemClick,
		routes,
		position,
		slideBg = false,
		liftIn = false,
		overlayClasses = undefined,
	}: Props = $props();
</script>

<div
	id="nav--mobile-overlay"
	class={overlayClasses ?? 'bg-app-bg'}
	style="--duration: {slideBg ? '150ms' : '0ms'}"
></div>

<nav
	id="nav--mobile"
	class="fixed left-0 top-[var(--open-nav-height)] -z-40 h-screen-nav w-full overflow-y-auto
		{position === 'center' ? 'place-items-center' : 'p-page'}"
>
	<ul aria-label="main navigation" class="flex flex-col space-y-6">
		{#each routes as route, i}
			<span class="route-item" style="--duration: {liftIn ? '150ms' : '0ms'}; --delay: {liftIn ? i * 50 : 0}ms;">
				<MobileRoute {route} {onNavItemClick}>
					{#snippet onGroupLine()}
						{#if route.groupText === 'Security'}
							<form action="/logout?/logoutCurrent" method="post">
								<button type="submit" class="btn btn-ghost text-base">
									<small>{'Sign out'}</small>
								</button>
							</form>
						{/if}
					{/snippet}
				</MobileRoute>
			</span>

			{#if i !== routes.length - 1}
				<div class="h-px w-full bg-gray-5/50"></div>
			{/if}
		{/each}
	</ul>
</nav>

<style lang="postcss">
	:global(#mobile-nav-btn ~ #nav--mobile-overlay) {
		@apply -z-50 h-screen w-full;
	}
	:global(#mobile-nav-btn:not(:checked) ~ #nav--mobile-overlay) {
		@apply max-h-0 opacity-0;
	}
	:global(#mobile-nav-btn:checked ~ #nav--mobile-overlay) {
		@apply fixed left-0 top-0 max-h-screen opacity-100;
		transition:
			opacity var(--duration) ease-in-out,
			max-height var(--duration) ease-in-out;
	}

	:global(#mobile-nav-btn:not(:checked) ~ #nav--mobile) {
		display: none;
	}
	:global(#mobile-nav-btn:checked ~ #nav--mobile) {
		display: grid;
	}

	:global(#mobile-nav-btn ~ #nav--mobile .route-item) {
		@apply opacity-0;
	}
	:global(#mobile-nav-btn:checked ~ #nav--mobile .route-item) {
		animation: liftIn var(--duration) cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
		animation-delay: var(--delay);
		transform: scale(0.5) translateY(150px);
		transform-origin: center center;
		filter: blur(5px);
	}

	@media (prefers-reduced-motion) {
		:global(#mobile-nav-btn:checked ~ #nav--mobile-overlay) {
			transition:
				opacity 0ms,
				max-height 0ms !important;
		}

		:global(#mobile-nav-btn:checked ~ #nav--mobile .route-item) {
			animation-duration: 0ms !important;
			animation-delay: 0ms !important;
		}
	}

	@keyframes liftIn {
		0% {
			opacity: 0;
			transform: scale(0.5) translateY(150px);
			filter: blur(5px);
		}
		50% {
			filter: blur(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
			filter: blur(0);
		}
	}
</style>
