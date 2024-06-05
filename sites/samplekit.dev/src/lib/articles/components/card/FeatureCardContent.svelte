<script lang="ts">
	import { clickOn } from '$lib/actions';
	import { BookOpenText, Boxes, Code } from '$lib/styles/icons';

	interface Props {
		feature: {
		title: string;
		description: string;
		tags?: string[] | null;
		articleSlug: string;
		implementationSlug: string;
		srcCodeHref: string;
	},
		tabindex?: 0 | -1,
		onclick?: (event: any) => void,
		onkeydown?: (event: any) => void
	}

	let {
		feature,
		tabindex = 0,
		onclick,
		onkeydown
	}: Props = $props();
</script>

<div class="flex flex-1 flex-col p-8">
	<h3 class="mb-8 text-2xl font-semibold text-accent-12 @sm:min-h-[4rem]">{feature.title}</h3>
	<p class="mb-8 flex-1 text-sm text-gray-12 @sm:text-base">{feature.description}</p>
	{#if feature.tags?.length}
		<ul class="flex min-h-[3rem] flex-wrap items-start gap-2">
			{#each feature.tags as tag}
				<li class="rounded-badge bg-accent-12/10 px-2.5 py-0.5 text-xs font-medium text-gray-11">
					{tag}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<div class="grid grid-cols-3">
	<a
		{tabindex}
		{onclick}
		{onkeydown}
		use:clickOn={['Space']}
		class="z-10 flex justify-center py-3 text-gray-11 outline-1 -outline-offset-1 hover:bg-accent-5/80 hover:text-gray-12 focus:bg-accent-4/80 focus:text-gray-12"
		class:rounded-bl-card={true}
		href="/articles/{feature.articleSlug}"
		aria-label="Tutorial"
		title="Tutorial"
	>
		<BookOpenText />
	</a>
	<a
		{tabindex}
		{onclick}
		{onkeydown}
		use:clickOn={['Space']}
		class="z-10 flex justify-center py-3 text-gray-11 outline-1 -outline-offset-1 hover:bg-accent-5/80 hover:text-gray-12 focus:bg-accent-4/80 focus:text-gray-12"
		href={feature.implementationSlug}
		aria-label="Implementation"
		title="Implementation"
	>
		<Boxes />
	</a>
	<a
		{tabindex}
		{onclick}
		{onkeydown}
		use:clickOn={['Space']}
		class="z-10 flex justify-center py-3 text-gray-11 outline-1 -outline-offset-1 hover:bg-accent-5/80 hover:text-gray-12 focus:bg-accent-4/80 focus:text-gray-12"
		class:rounded-br-card={true}
		href={feature.srcCodeHref}
		aria-label="Source Code"
		title="Source Code"
		target="_blank"
		rel="noopener noreferrer"
	>
		<Code />
	</a>
</div>
