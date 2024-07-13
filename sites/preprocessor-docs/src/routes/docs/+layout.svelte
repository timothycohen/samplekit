<script lang="ts">
	import {
		createSidebarContext,
		createMenubarContext,
		useSidebarContext,
		useMenubarContext,
		MenubarContent,
		SidebarContent,
		navbarHeightPx,
		contentMaxWidthPx,
		sidebarWidthPx,
	} from '$lib/nav';
	import { Icon } from '$lib/styles';

	const { children, data } = $props();

	createSidebarContext(data.initialSidebarState);
	const sidebar = useSidebarContext();
	createMenubarContext({
		get value() {
			return sidebar.open;
		},
	});
	const menubar = useMenubarContext();

	const toggleChecked = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
		(sidebar.open = e.currentTarget.checked);
</script>

<div
	data-toc-wrapper
	class="layout-wrapper"
	style="--menubar-top: {menubar.topPx}px;
				 --menubar-border: {menubar.border ? 'hsl(var(--gray-5))' : 'transparent'};
				 --nav-height: {navbarHeightPx}px;
				 --sidebar-width: {sidebarWidthPx}px;
				 --content-max-width: {contentMaxWidthPx}px;
		"
>
	<input id="sidebar-toggler" type="checkbox" checked={sidebar.open} onchange={toggleChecked} />

	<nav class="sidebar" aria-label="Table of Contents">
		<SidebarContent toc={data.toc} />
	</nav>

	<div class="page-wrapper">
		<div class="menubar-wrapper">
			<div class="menubar">
				<label
					for="sidebar-toggler"
					title="Toggle Table of Contents"
					aria-label="Toggle Table of Contents"
					aria-controls="sidebar"
				>
					<Icon icon="hamburger" />
				</label>
				<MenubarContent />
			</div>
		</div>

		<main class="main-content prose prose-lg prose-radix">
			{@render children()}
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
		@apply shadow-3;
	}

	/* hide sidebar */
	#sidebar-toggler:not(:checked) ~ .sidebar {
		transform: translateX(calc(0px - var(--sidebar-width)));
	}

	/* push main content on mobile */
	#sidebar-toggler:checked ~ .page-wrapper {
		transform: translateX(var(--sidebar-width));
	}

	/* fit main content on desktop */
	@media (min-width: 620px) {
		#sidebar-toggler:checked ~ .page-wrapper {
			transform: none;
			margin-inline-start: var(--sidebar-width);
		}
	}

	/* make sure tabbing over the toggler doesn't scroll to the top of the page */
	#sidebar-toggler {
		@apply sticky flex h-0 w-0 opacity-0;
		top: var(--menubar-top);
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
	}

	.menubar-wrapper {
		@apply sticky z-40 flex w-full flex-wrap items-center gap-4 bg-app-bg;
		top: var(--menubar-top);
		height: var(--nav-height);
	}

	.menubar {
		@apply absolute inset-px flex items-center justify-center gap-4 border-b px-4;
		transition: border-color 300ms ease;
		border-color: var(--menubar-border);
	}

	.main-content {
		max-width: var(--content-max-width);
		margin-inline: auto;
		@apply p-page;
	}
</style>
