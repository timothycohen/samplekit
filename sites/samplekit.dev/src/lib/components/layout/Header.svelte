<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { keyboard } from '$lib/actions';
	import { themeController, ThemeSwitchDayNightSystem } from '$lib/styles';
	import { Logo } from '..';
	import DesktopNavItem from './nav/DesktopNavItem.svelte';
	import MobileNav from './nav/MobileNav.svelte';
	import MobileNavToggler from './nav/MobileNavToggler.svelte';
	import { MobileNavController } from './nav/mobileNavController';
	import { getDesktopNavRoutes, getMobileNavRoutes } from './nav/routes';

	const mobileNavPosition: 'left' | 'center' = 'left';

	const mobileNavController = new MobileNavController({
		transitionWidth: 768,
		animationDuration: 0,
		trapFocus: { selectorsBefore: ['#mobile-nav-btn'], selectorsAfter: ['#theme-switch-btn'] },
		getMobileNavEl: () => (document.querySelector('#nav--mobile') as HTMLElement) || null,
		getHeaderEl: () => (document.querySelector('#header') as HTMLElement) || null,
	});

	$: mobileNavOpen = mobileNavController.isOpen;
	$: desktopNavPages = getDesktopNavRoutes(!!$page.data['user']);
	$: mobileNavPages = getMobileNavRoutes(!!$page.data['user']);

	onMount(() => {
		mobileNavController.listen();
		document.documentElement.style.setProperty('scroll-padding-top', 'calc(var(--nav-height) + 1rem)');
		return () => {
			document.documentElement.style.removeProperty('scroll-padding-top');
			mobileNavController.destroy();
		};
	});
</script>

<header
	id="header"
	class="bg-app-bg/80 dark:shadow-2 h-nav fixed left-0
	top-0 z-30 flex w-full drop-shadow backdrop-blur-md dark:drop-shadow-none"
>
	<div class="px-page flex h-full items-center text-2xl">
		<Logo link onAnchorClick={mobileNavController.close} />
	</div>

	<span class="px-page relative ml-auto flex flex-col justify-center">
		<span class="flex h-full items-center justify-end gap-8">
			<nav id="nav--desktop" class="hidden md:block">
				<ul class="flex items-center gap-4 lg:gap-10" aria-label="main navigation">
					{#each desktopNavPages as entry (entry.url)}
						<DesktopNavItem {entry} current={(url) => ($page.url.pathname === url ? 'page' : undefined)} />
					{/each}
				</ul>
			</nav>

			<span class="js-only block h-6 w-6 shrink-0 animate-[fadeIn_100ms_ease-in-out_forwards]">
				<ThemeSwitchDayNightSystem
					let:next
					let:prev
					schemeSystem={$themeController.schemeSystem}
					mode={$themeController.mode}
					modeApplied={$themeController.modeApplied}
					onModeChange={themeController.setMode}
				>
					<a
						tabindex="-1"
						href="/appearance"
						class="hover:bg-gray-4 rounded-b-card focus-visible:bg-gray-4 text-gray-11 decoration-accent-6 flex items-center p-2 pl-4 text-xs font-light underline-offset-2 hover:underline"
						use:keyboard={{ ArrowUp: [prev], ArrowDown: [next] }}
					>
						Customize appearance
					</a>
				</ThemeSwitchDayNightSystem>
			</span>
			<span class="flex items-center justify-center md:hidden">
				<MobileNavToggler toggle={mobileNavController.toggle} mobileNavOpen={$mobileNavOpen} />
				<MobileNav
					position={mobileNavPosition}
					onNavItemClick={() => mobileNavController.close()}
					routes={mobileNavPages}
				/>
			</span>
		</span>
	</span>
</header>

<div class="h-nav"></div>
