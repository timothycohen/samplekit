<script lang="ts">
	interface Props { children?: import('svelte').Snippet, children?: import('svelte').Snippet }

	let { children, children }: Props = $props();
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	import { AccountLayout } from '$lib/components';
</script>

{#if $page.data['user']}
	<AccountLayout>{@render children?.()}</AccountLayout>
{:else}
	<div class="page">
		{@render children?.()}
	</div>
{/if}
