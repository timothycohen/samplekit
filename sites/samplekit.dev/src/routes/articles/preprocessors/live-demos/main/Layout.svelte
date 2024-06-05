<script lang="ts">
	interface Props {
		title: string,
		write?: import('svelte').Snippet,
		process?: import('svelte').Snippet,
		render?: import('svelte').Snippet
	}

	let {
		title,
		write,
		process,
		render
	}: Props = $props();
</script>

<span class="font-serif text-3xl font-bold text-accent-12"><h2>{title}</h2></span>

<div class="prose prose-lg prose-radix max-w-none">
	<div class="lg:grid lg:grid-cols-2 lg:gap-8">
		<div class="col-start-1 col-end-2 row-start-1 row-end-2">
			<div>
				<p><span class="text-sm font-light">01.</span> We can write:</p>
				{@render write()}
			</div>
		</div>
		<div class="col-start-2 col-end-3 row-start-1 row-end-3">
			<div>
				<p><span class="text-sm font-light">02.</span> It will process to (sans whitespace):</p>
				{@render process()}
			</div>
		</div>
		<div class="col-start-1 col-end-2 row-start-2 row-end-3">
			<div><p><span class="text-sm font-light">03.</span> And render as:</p></div>
			{@render render()}
		</div>
	</div>
</div>
