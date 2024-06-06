<script lang="ts">
	import { AccountLayout } from '$lib/components';

	const { children } = $props();
</script>

<AccountLayout>{@render children()}</AccountLayout>
