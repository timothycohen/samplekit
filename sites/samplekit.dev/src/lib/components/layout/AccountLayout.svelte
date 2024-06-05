<script lang="ts">
	interface Props { children?: import('svelte').Snippet }

	let { children }: Props = $props();
	import SidebarRoute from './nav/SidebarRoute.svelte';
	import { accountLayoutRoutes } from './nav/routes';
</script>

<div class="mx-auto grid max-w-screen-xl py-page full md:grid-cols-[13rem_1fr]">
	<div class="hidden flex-col md:flex">
		<div class="t-h5 pb-4 pl-7 font-bold">Account</div>

		<ul>
			{#each accountLayoutRoutes as route}
				<SidebarRoute {route} />
			{/each}
		</ul>
	</div>

	<div class="px-page">
		<div class="mx-auto max-w-4xl">
			{@render children?.()}
		</div>
	</div>
</div>
