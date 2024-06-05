<script lang="ts">
	export let title: string;
</script>

<span class="font-serif text-3xl font-bold text-accent-12"><h2>{title}</h2></span>

<div class="lg:grid lg:grid-cols-2 lg:gap-8">
	<div class="col-start-1 col-end-2 row-start-1 row-end-2">
		<div class="prose prose-lg prose-radix">
			<p><span class="text-sm font-light">01.</span> We can write:</p>
			<slot name="write" />
		</div>
	</div>
	<div class="col-start-2 col-end-3 row-start-1 row-end-3">
		<div class="prose prose-lg prose-radix">
			<p><span class="text-sm font-light">02.</span> It will process to (sans whitespace):</p>
			<slot name="process" />
		</div>
	</div>
	<div class="col-start-1 col-end-2 row-start-2 row-end-3">
		<div class="prose prose-lg prose-radix"><p><span class="text-sm font-light">03.</span> And render as:</p></div>
		<slot name="render" />
	</div>
</div>
