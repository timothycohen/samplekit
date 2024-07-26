<script lang="ts">
	import { page } from '$app/stores';
	import { toc } from '$lib/nav/sidebar';
	import TOCActive from './TOCActive.svelte';
	import TOCInactive from './TOCInactive.svelte';
	import { useSidebarCtx } from './context.svelte';
	import { TocObserver } from './observeToc.svelte';
	import type { Pathname } from './generated/toc';

	const sidebar = useSidebarCtx();

	const { pathname }: { pathname: Pathname } = $props();

	const pages = [
		{ href: '/docs/code-decoration/', title: 'Code Decoration' },
		{ href: '/docs/markdown/', title: 'Markdown' },
		{ href: '/docs/math/', title: 'Math' },
	] satisfies Array<{ href: Pathname; title: string }>;

	const tocObserver = new TocObserver();
	const tocTree = $derived(toc[pathname]);

	$effect(() => {
		tocObserver.observe({ tocTree, wrappingSelector: '[data-toc-wrapper]' });
		return () => {
			tocObserver.disconnect();
		};
	});
</script>

<div class="absolute inset-0 ml-4 overflow-y-auto overflow-x-hidden overscroll-contain">
	<div style="height: var(--full-nav-height);" class="flex items-center">
		<h2 class="text-xl font-bold">Docs</h2>
	</div>
	<div class="mb-8 mt-6 space-y-8">
		{#each pages as { href, title }}
			{@const current = $page.url.pathname === href ? 'page' : null}
			<div>
				<a
					{href}
					class="text-xl {current ? 'inline-block w-full text-accent-11' : 'text-gray-12 hover:text-accent-11'}"
					tabindex={sidebar.open ? 0 : -1}
				>
					{title}
				</a>
				<div class="pl-4 pt-1 text-gray-11">
					{#if current}
						<TOCActive {tocTree} isActive={tocObserver.isActive} level={1} />
					{:else if toc[href]}
						<TOCInactive tocTree={toc[href]!} level={1} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
