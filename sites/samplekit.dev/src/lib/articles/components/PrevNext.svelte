<script lang="ts">
	import { FeatureCard } from './card';
	import type { LoadedFrontMatter } from '../schema';

	interface Props {
		prev: LoadedFrontMatter | undefined;
		next: LoadedFrontMatter | undefined;
	}

	const { prev, next }: Props = $props();
</script>

{#if prev}
	<div class="mx-auto w-full lg:w-80">
		<h2 class="t-h4 my-4">Previous Article</h2>
		<FeatureCard metadata={prev} />
	</div>
{/if}

{#if next}
	<div class="mx-auto w-full lg:w-80">
		<h2 class="t-h4 my-4">Next Article</h2>
		<FeatureCard metadata={next} />
	</div>
{/if}
