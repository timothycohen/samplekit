<script lang="ts">
	import { BookOpenText, Boxes, Code } from 'lucide-svelte';
	import { clickOn } from '$lib/actions';

	export let feature: {
		title: string;
		description: string;
		tags?: string[] | null;
		articleSlug: string;
		implementationSlug: string;
		srcCodeHref: string;
	};
	export let tabindex: 0 | -1 = 0;
</script>

<div class="flex flex-1 flex-col p-8">
	<h3 class="text-accent-12 @sm:min-h-[4rem] mb-8 text-2xl font-semibold">{feature.title}</h3>
	<p class="text-gray-12 @sm:text-base mb-8 flex-1 text-sm">{feature.description}</p>
	{#if feature.tags?.length}
		<ul class="flex min-h-[3rem] flex-wrap items-start gap-2">
			{#each feature.tags as tag}
				<li class="text-gray-11 bg-accent-12/10 rounded-badge px-2.5 py-0.5 text-xs font-medium">
					{tag}
				</li>
			{/each}
		</ul>
	{/if}
</div>

<div class="grid grid-cols-3">
	<a
		{tabindex}
		on:click|stopPropagation
		on:keydown|stopPropagation
		use:clickOn={['Space']}
		class="hover:bg-accent-5/80 focus:bg-accent-4/80 focus:text-gray-12 text-gray-11 hover:text-gray-12 z-10 flex justify-center py-3 outline-1 -outline-offset-1"
		class:rounded-bl-card={true}
		href="/articles/{feature.articleSlug}"
		aria-label="Tutorial"
		title="Tutorial"
	>
		<BookOpenText />
	</a>
	<a
		{tabindex}
		on:click|stopPropagation
		on:keydown|stopPropagation
		use:clickOn={['Space']}
		class="hover:bg-accent-5/80 focus:bg-accent-4/80 focus:text-gray-12 text-gray-11 hover:text-gray-12 z-10 flex justify-center py-3 outline-1 -outline-offset-1"
		href={feature.implementationSlug}
		aria-label="Implementation"
		title="Implementation"
	>
		<Boxes />
	</a>
	<a
		{tabindex}
		on:click|stopPropagation
		on:keydown|stopPropagation
		use:clickOn={['Space']}
		class="hover:bg-accent-5/80 focus:bg-accent-4/80 focus:text-gray-12 text-gray-11 hover:text-gray-12 z-10 flex justify-center py-3 outline-1 -outline-offset-1"
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
