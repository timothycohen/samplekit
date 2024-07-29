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

	const mobileNavOpen = $derived(mobileNavController.isOpen);
	const desktopNavPages = $derived(getDesktopNavRoutes(!!$page.data['user']));
	const mobileNavPages = $derived(getMobileNavRoutes(!!$page.data['user']));

	onMount(() => {
		mobileNavController.listen();
		document.documentElement.style.setProperty('scroll-padding-top', 'calc(var(--nav-height) + 1rem)');
		return () => {
			document.documentElement.style.removeProperty('scroll-padding-top');
			mobileNavController.destroy();
		};
	});

	// todo svelte-5-prettier inline definition breaks prettier
	type AfterMenuProps = { prev: (e: KeyboardEvent) => void; next: (e: KeyboardEvent) => void };
</script>

<header
	id="header"
	class="fixed left-0 top-0 z-30 flex
	h-nav w-full bg-app-bg/80 drop-shadow backdrop-blur-md dark:shadow-2 dark:drop-shadow-none"
>
	<div class="flex h-full items-center px-page text-2xl">
		<Logo link onAnchorClick={mobileNavController.close} />
	</div>

	<span class="relative ml-auto flex flex-col justify-center px-page">
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
					schemeSystem={$themeController.schemeSystem}
					mode={$themeController.mode}
					modeApplied={$themeController.modeApplied}
					onModeChange={themeController.setMode}
				>
					{#snippet afterMenu({ prev, next }: AfterMenuProps)}
						<a
							tabindex="-1"
							href="/appearance"
							class="flex items-center rounded-b-card p-2 pl-4 text-xs font-light text-gray-11 decoration-accent-6 underline-offset-2 hover:bg-gray-4 hover:underline focus-visible:bg-gray-4"
							use:keyboard={{ ArrowUp: [prev], ArrowDown: [next] }}
						>
							Customize appearance
						</a>
					{/snippet}
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
