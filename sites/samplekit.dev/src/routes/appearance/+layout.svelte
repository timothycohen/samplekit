<script lang="ts">
	import { page } from '$app/stores';
	import { AccountLayout } from '$lib/components';
</script>

{#if $page.data['user']}
	<AccountLayout><slot /></AccountLayout>
{:else}
	<div class="page">
		<slot />
	</div>
{/if}
