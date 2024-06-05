<script lang="ts">
	interface Props { data: any }

	let { data }: Props = $props();
	import Page from './Page.svx';
</script>

<Page {data} />
