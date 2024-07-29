<script lang="ts">
	import { page } from '$app/stores';
	import { AccountLayout } from '$lib/components';

	const { children } = $props();
</script>

{#if $page.data['user']}
	<AccountLayout>{@render children()}</AccountLayout>
{:else}
	<div class="page">
		{@render children()}
	</div>
{/if}
