<script lang="ts">
	import { clickOn } from '$lib/actions';
	import I from '$lib/icons';
	import type { LoadedFrontMatter } from '$lib/articles/schema';

	const {
		metadata,
	}: {
		metadata: Pick<LoadedFrontMatter, 'articlePath' | 'implementationPath' | 'publishedAt' | 'updates' | 'srcCodeHref'>;
	} = $props();
</script>

<div class="grid grid-cols-[3fr,1fr,1fr,1fr]">
	<div class="z-10 flex px-4 py-3 text-gray-11/75">
		<div class="flex items-end text-xs">
			{metadata.updates?.length
				? `Updated: ${metadata.updates[0]!.at.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`
				: metadata.publishedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
		</div>
	</div>

	<a
		use:clickOn={['Space']}
		class="z-10 flex justify-center py-3 text-gray-11 outline-1 -outline-offset-1 hover:bg-accent-5/80 hover:text-gray-12 focus:bg-accent-4/80 focus:text-gray-12"
		href={metadata.articlePath}
		aria-label="Tutorial"
		title="Tutorial"
	>
		<I.BookOpenText class="!stroke-[1]" />
	</a>
	<a
		use:clickOn={['Space']}
		class="z-10 flex justify-center py-3 text-gray-11 outline-1 -outline-offset-1 hover:bg-accent-5/80 hover:text-gray-12 focus:bg-accent-4/80 focus:text-gray-12"
		href={metadata.implementationPath}
		aria-label="Implementation"
		title="Implementation"
	>
		<I.Boxes class="!stroke-[1]" />
	</a>
	<a
		use:clickOn={['Space']}
		class="z-10 flex justify-center py-3 text-gray-11 outline-1 -outline-offset-1 hover:bg-accent-5/80 hover:text-gray-12 focus:bg-accent-4/80 focus:text-gray-12"
		class:rounded-br-card={true}
		href={metadata.srcCodeHref}
		aria-label="Source Code"
		title="Source Code"
	>
		<I.Code class="!stroke-[1]" />
	</a>
</div>
