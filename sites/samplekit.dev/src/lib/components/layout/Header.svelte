<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/stores';
	import LogoLink from '../LogoLink.svelte';
	import DesktopNavItem from './nav/DesktopNavItem.svelte';
	import MobileNav from './nav/MobileNav.svelte';
	import MobileNavToggler from './nav/MobileNavToggler.svelte';
	import { useMobileNavCtx } from './nav/mobileNav.ctx.svelte';
	import { getDesktopNavRoutes, getMobileNavRoutes } from './nav/routes';

	type Props = {
		children?: Snippet;
	};

	const { children }: Props = $props();

	const { mobileNav, position } = useMobileNavCtx();

	const desktopNavPages = $derived(getDesktopNavRoutes(!!$page.data['user']));
	const mobileNavPages = $derived(getMobileNavRoutes(!!$page.data['user']));

	onMount(() => {
		document.documentElement.style.setProperty('scroll-padding-top', 'calc(var(--open-nav-height) + 1rem)');
		return () => {
			document.documentElement.style.removeProperty('scroll-padding-top');
		};
	});
</script>

<header
	id="header"
	class="fixed left-0 top-0 z-30 flex
	h-nav w-full bg-app-bg/80 drop-shadow backdrop-blur-md dark:shadow-2 dark:drop-shadow-none"
	style="padding-right: var(--scrollbar-width);"
>
	<span class="pl-4 sm:pl-2">
		<LogoLink onAnchorClick={() => (mobileNav.open = false)} textClass="hidden sm:block" />
	</span>

	<div
		class="fixed left-0 right-0 top-0 mx-auto flex h-nav w-fit items-center"
		style="right: calc(var(--scrollbar-width, 0px) + 1rem);"
		id="portal-target-header"
	></div>

	<span class="relative ml-auto flex flex-col justify-center px-page">
		<span class="flex h-full items-center justify-end gap-8">
			<nav id="nav--desktop" class="hidden md:block">
				<ul class="flex items-center gap-4 lg:gap-10" aria-label="main navigation">
					{#each desktopNavPages as entry (entry.url)}
						<DesktopNavItem {entry} current={(url) => ($page.url.pathname === url ? 'page' : undefined)} />
					{/each}
				</ul>
			</nav>

			{@render children?.()}

			<span class="flex items-center justify-center md:hidden">
				<MobileNavToggler toggle={mobileNav.toggle} mobileNavOpen={mobileNav.open} />
				<MobileNav {position} onNavItemClick={() => (mobileNav.open = false)} routes={mobileNavPages} />
			</span>
		</span>
	</span>
</header>

<div class="h-nav"></div>
