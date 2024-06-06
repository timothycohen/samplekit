<script lang="ts">
	const { data } = $props();
</script>

<div
	class="page space-y-4 p-8"
	style="--mauve-11: {data.colors.mauve11}; --mauve-12: {data.colors.mauve12}; --iris-1: {data.colors.iris1};"
>
	<section class="space-y-2">
		<h2 class="text-2xl font-bold">Todo</h2>
	</section>
</div>

<style>
	.page {
		color-scheme: dark;
		color: var(--mauve-11);
		background-color: var(--iris-1);
		min-height: 100vh;
	}

	h2 {
		color: var(--mauve-12);
	}
</style>
