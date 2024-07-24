<script lang="ts">
	import { createTableOfContents } from '@melt-ui/svelte';
	import { page } from '$app/stores';
	import { navbarHeightPx } from '../consts';
	import TOCBase from './TOCBase.svelte';
	import TOCMelt from './TOCMelt.svelte';
	import { useSidebarCtx } from './context.svelte';

	type TocItem = { title: string; href: string; children?: TocItem[] };

	const { toc }: { toc: Record<string, TocItem[]> } = $props();

	const sidebar = useSidebarCtx();

	const pages = [
		{ href: '/docs/code-decoration', title: 'Code Decoration' },
		{ href: '/docs/markdown', title: 'Markdown' },
		{ href: '/docs/math', title: 'Math' },
	];

	const {
		elements: { item },
		states: { activeHeadingIdxs, headingsTree },
	} = createTableOfContents({
		selector: '[data-toc-wrapper]',
		activeType: 'all',
		scrollOffset: navbarHeightPx,
		headingFilterFn: (heading) => !!heading.dataset['toc'],
	});

	const tocReady = $derived(!!$activeHeadingIdxs.length);
</script>

<div class="absolute inset-0 ml-4 overflow-y-auto overflow-x-hidden overscroll-contain">
	<div style="height: var(--open-nav-height);" class="flex items-center">
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
					{#if current && tocReady}
						<TOCMelt tree={$headingsTree} activeHeadingIdxs={$activeHeadingIdxs} {item} level={1} />
					{:else if toc[href]}
						<TOCBase tree={toc[href]!} level={1} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
