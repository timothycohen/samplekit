<script lang="ts">
	import { createTableOfContents } from '@melt-ui/svelte';
	import { page } from '$app/stores';
	import { navbarHeightPx } from '../consts';
	import TOCBase from './TOCBase.svelte';
	import TOCMelt from './TOCMelt.svelte';
	import { useSidebarContext } from './context.svelte';

	type TocItem = { title: string; href: string; children?: TocItem[] };

	const { toc }: { toc: Record<string, TocItem[]> } = $props();

	const sidebar = useSidebarContext();

	const pages = [
		{ href: '/docs/codeblocks', title: 'Codeblocks' },
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
		scrollBehaviour: 'smooth',
		headingFilterFn: (heading) => !!heading.dataset['toc'],
	});

	const tocReady = $derived(!!$activeHeadingIdxs.length);
</script>

<div class="absolute inset-0 ml-4 overflow-y-auto overscroll-contain py-4">
	<h2 class="mb-8 text-xl font-bold">Docs</h2>
	<div class="space-y-4">
		{#each pages as { href, title }}
			{@const current = $page.url.pathname === href ? 'page' : null}
			<div>
				<a {href} class="text-xl {current ? 'text-accent-9' : 'hover:text-accent-9'}" tabindex={sidebar.open ? 0 : -1}>
					{title}
				</a>
				<div class="pl-4 pt-2">
					{#if current && tocReady}
						<TOCMelt tree={$headingsTree} activeHeadingIdxs={$activeHeadingIdxs} {item} />
					{:else}
						<TOCBase tree={toc[href]} />
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
