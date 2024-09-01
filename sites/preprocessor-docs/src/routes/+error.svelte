<script>
	import { page } from '$app/stores';
	// Note: this file will not be used in the adapter-static build
	// configure nginx-default.conf to serve /404
</script>

<section class="mx-auto h-full w-full max-w-7xl flex-1 p-page pt-16">
	<div class="space-y-1">
		<h1 class="text-center font-mono text-4xl font-extrabold text-accent-9">{$page.status}</h1>
		{#if $page.error?.message}
			<div class="text-center text-4xl font-extrabold text-accent-12">{$page.error.message}</div>
		{:else if $page.status === 500}
			<div class="text-center text-4xl font-extrabold text-accent-12">Internal server error</div>
		{/if}
	</div>

	<div class="mb-4 mt-16 text-3xl">Documentation:</div>

	<div class="flex flex-col space-y-4 sm:flex-row sm:space-y-0">
		<a href="/docs/code-decoration/" class="btn btn-ghost inline-block w-fit text-xl">Code Decoration</a>
		<a href="/docs/math/" class="btn btn-ghost inline-block w-fit text-xl">Math</a>
		<a href="/docs/markdown/" class="btn btn-ghost inline-block w-fit text-xl">Markdown</a>
	</div>
</section>
