<script lang="ts">
	import { derived } from 'svelte/store';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { searchParam, searchParams } from '$lib/stores';
	import FilterInputs from './FilterInputs.svelte';
	import Posts from './Posts.svelte';
	import { loadDummyData } from './demoData';

	const data = loadDummyData();
	const authors = searchParams('authors');
	const content = searchParam('content');
	const maxDaysOld = searchParam('max-days', {
		clean: (val) => {
			const data = val?.replaceAll(/[^0-9.]/g, '');
			if (!data) return null;
			const num = parseFloat(data);
			if (isNaN(num)) return null;
			return Math.max(1, Math.min(14, num)).toString();
		},
	});

	const resetFilters = () => {
		const mutSearchParams = new URLSearchParams($page.url.search);
		content.mutateSearchParams({ mutSearchParams });
		maxDaysOld.mutateSearchParams({ mutSearchParams });
		authors.mutateSearchParams({ mutSearchParams });
		goto(`?${mutSearchParams}`, { keepFocus: true, noScroll: true, replaceState: true });
	};

	const filteredPosts = derived([authors, content, maxDaysOld], ([$authors, $content, $maxDaysOld]) => {
		return data.messages.filter((message) => {
			if ($authors.length && !$authors.includes(message.author)) return false;

			if ($content && !message.message.includes($content)) return false;

			if ($maxDaysOld !== null) {
				let days = parseFloat($maxDaysOld);
				if (isNaN(days)) days = 0;
				const maxDaysAgo = new Date(Date.now() - 1000 * 60 * 60 * 24 * days);
				if (message.date < maxDaysAgo) return false;
			}

			return true;
		});
	});
</script>

<div class="mb-6 space-y-6">
	<h2 class="text-center text-accent-11">Simple Url State Controller Interactive Demo</h2>

	<div class="mx-auto w-fit rounded-full border border-accent-9 bg-accent-9/25 px-4 py-2 font-mono">
		<span>$page.url.search: </span>
		<span class="break-all text-gray-11">{$page.url.search}</span>
	</div>

	<FilterInputs authorNames={data.authors} {authors} {content} {maxDaysOld} />
</div>

<Posts posts={$filteredPosts} {resetFilters} />
