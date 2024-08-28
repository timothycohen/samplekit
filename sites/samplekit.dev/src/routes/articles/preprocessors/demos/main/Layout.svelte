<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		write: Snippet;
		process: Snippet;
		render: Snippet;
	}

	const { title, write, process, render }: Props = $props();
</script>

<span class="font-serif text-3xl font-bold text-accent-12"><h2>{title}</h2></span>

<div class="prose prose-radix max-w-none lg:prose-lg">
	<div class="lg:grid lg:grid-cols-2 lg:gap-8">
		<div class="col-start-1 col-end-2 row-start-1 row-end-2">
			<div>
				<div class="text-gray-12"><p><span class="text-sm font-light">01.</span> Write:</p></div>
				{@render write()}
			</div>
		</div>
		<div class="col-start-2 col-end-3 row-start-1 row-end-3">
			<div>
				<div class="text-gray-12"><p><span class="text-sm font-light">02.</span> Processed (sans whitespace):</p></div>
				{@render process()}
			</div>
		</div>
		<div class="col-start-1 col-end-2 row-start-2 row-end-3">
			<div>
				<div class="text-gray-12"><p><span class="text-sm font-light">03.</span> Rendered:</p></div>
				{@render render()}
			</div>
		</div>
	</div>
</div>
