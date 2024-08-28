<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { page } from '$app/stores';
	import I from '$lib/icons';
	import {
		createTopbarCtx,
		useSidebarCtx,
		useTopbarCtx,
		TopbarContent,
		SidebarContent,
		createSidebarCtx,
		getStoredSidebarOnClient,
	} from '$lib/nav';
	import { useThemeControllerCtx } from '$lib/styles';
	import { createCodeThemeCtx } from './codeTheme.ctx.svelte';
	import type { Pathname } from '$lib/nav/sidebar/generated/toc';

	const { children }: { children: Snippet } = $props();

	createSidebarCtx(getStoredSidebarOnClient());
	const sidebar = useSidebarCtx();
	createTopbarCtx({
		get value() {
			return sidebar.open;
		},
	});
	const topbar = useTopbarCtx();

	createCodeThemeCtx(useThemeControllerCtx());

	$effect(() =>
		document.documentElement.style.setProperty('--nav-height', `${sidebar.open ? `var(--full-nav-height)` : '0px'}`),
	);
	$effect(() => document.documentElement.style.setProperty('--topbar-top', `${topbar.topPx}px`));
	$effect(() =>
		document.documentElement.style.setProperty(
			'--topbar-border',
			`${topbar.borderVisible ? 'var(--visible-topbar-border)' : 'var(--hidden-topbar-border)'}`,
		),
	);
	onMount(() => {
		document.documentElement.removeAttribute('data-pre-hydration-sidebar');
	});

	const toggleChecked = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
		sidebar.open = e.currentTarget.checked;
	};
</script>

<div data-toc-wrapper class="layout-wrapper">
	<input id="sidebar-toggler" type="checkbox" checked={sidebar.open} onchange={toggleChecked} />

	<nav class="sidebar" aria-label="Table of Contents">
		<SidebarContent pathname={$page.url.pathname as Pathname} />
	</nav>

	<div class="page-wrapper">
		<div class="topbar-wrapper">
			<div class="topbar">
				<label
					for="sidebar-toggler"
					title="Toggle Table of Contents"
					aria-label="Toggle Table of Contents"
					aria-controls="sidebar"
				>
					<I.Menu />
				</label>
				<TopbarContent />
			</div>
		</div>

		<main>
			<article class="main-content prose prose-radix lg:prose-lg">
				{@render children()}
			</article>
		</main>
	</div>
</div>

<style lang="postcss">
	.layout-wrapper {
		overflow-x: clip;
	}

	/* show sidebar */
	.sidebar {
		position: fixed;
		left: 0;
		top: 0;
		bottom: 0;
		width: var(--sidebar-width);
		background-color: theme(colors.accent.2);
		transition: transform 0.3s;
		z-index: 50;
		border-right: 1px solid theme(colors.gray.5);
		@apply respect-reduced-motion;
	}

	/* match rose-pine-dawn and catppuccin-latte */
	:global([data-theme='daffodil']) .sidebar {
		background-color: hsl(32deg 56% 95%);
	}
	:global([data-theme='bellflower']) .sidebar {
		background-color: hsl(214deg 26% 95%);
	}

	/* show/hide sidebar */
	#sidebar-toggler:checked ~ .sidebar {
		transform: translateX(0px);
	}
	:global([data-pre-hydration-sidebar='true']) .sidebar {
		transform: translateX(0px) !important;
	}
	#sidebar-toggler:not(:checked) ~ .sidebar {
		transform: translateX(calc(0px - var(--sidebar-width)));
	}
	:global([data-pre-hydration-sidebar='false']) .sidebar {
		transform: translateX(calc(0px - var(--sidebar-width))) !important;
	}

	/* push main content on mobile */
	#sidebar-toggler:checked ~ .page-wrapper {
		transform: translateX(var(--sidebar-width));
	}
	:global([data-pre-hydration-sidebar='true']) .page-wrapper {
		transform: translateX(var(--sidebar-width)) !important;
	}
	#sidebar-toggler:not(:checked) ~ .page-wrapper {
		transform: translateX(0px);
	}
	:global([data-pre-hydration-sidebar='false']) .page-wrapper {
		transform: translateX(0px) !important;
	}

	/* fit main content on desktop */
	@media (min-width: 640px) {
		#sidebar-toggler:checked ~ .page-wrapper {
			transform: none;
			margin-inline-start: var(--sidebar-width);
		}
		:global([data-pre-hydration-sidebar='true']) .page-wrapper {
			transform: none !important;
			margin-inline-start: var(--sidebar-width) !important;
		}
	}

	/* make sure tabbing over the toggler doesn't scroll to the top of the page */
	#sidebar-toggler {
		@apply sticky flex h-0 w-0 opacity-0;
		top: var(--topbar-top);
	}

	/* highlight the icon when tabbing over the invisible toggler */
	#sidebar-toggler:focus-visible ~ .page-wrapper label[for='sidebar-toggler'] {
		@apply outline;
	}

	label[for='sidebar-toggler'] {
		cursor: pointer;
	}

	/* make smooth transitions when opening/closing sidebar and resizing between mobile/desktop */
	.page-wrapper {
		transition:
			transform 0.3s ease,
			margin-left 0.3s ease;
		@apply respect-reduced-motion;
	}

	.topbar-wrapper {
		@apply sticky z-40 flex w-full flex-wrap items-center gap-4 bg-app-bg;
		top: var(--topbar-top);
		height: var(--full-nav-height);
	}

	.topbar {
		@apply absolute inset-px flex items-center justify-center gap-4 border-b px-4;
		transition: border-color 300ms ease;
		border-color: var(--topbar-border);
	}

	:global(.no-js) .topbar {
		border-color: hsl(var(--gray-5));
	}

	:global(.no-js) .layout-wrapper {
		--nav-height: var(--full-nav-height);
	}

	.main-content {
		max-width: var(--content-max-width);
		margin-inline: auto;
		@apply p-page;
	}
</style>
