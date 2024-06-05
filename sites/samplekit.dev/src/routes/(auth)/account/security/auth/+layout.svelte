<script lang="ts">
	interface Props { children?: import('svelte').Snippet }

	let { children }: Props = $props();
	import { AccountLayout } from '$lib/components';
</script>

<AccountLayout>{@render children?.()}</AccountLayout>
