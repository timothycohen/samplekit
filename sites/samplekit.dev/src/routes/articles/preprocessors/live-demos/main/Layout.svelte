<script lang="ts">
	export let title: string;
</script>

<span class="text-accent-12 font-serif text-3xl font-bold"><h2>{title}</h2></span>

<div class="lg:grid lg:grid-cols-2 lg:gap-8">
	<div class="col-start-1 col-end-2 row-start-1 row-end-2">
		<div class="rad">
			<p><span class="text-sm font-light">01.</span> We can write:</p>
			<slot name="write" />
		</div>
	</div>
	<div class="col-start-2 col-end-3 row-start-1 row-end-3">
		<div class="rad">
			<p><span class="text-sm font-light">02.</span> It will process to (sans whitespace):</p>
			<slot name="process" />
		</div>
	</div>
	<div class="col-start-1 col-end-2 row-start-2 row-end-3">
		<div class="rad"><p><span class="text-sm font-light">03.</span> And render as:</p></div>
		<slot name="render" />
	</div>
</div>

<style lang="postcss">
	.rad {
		@apply prose prose-lg prose-radix;
	}
</style>
