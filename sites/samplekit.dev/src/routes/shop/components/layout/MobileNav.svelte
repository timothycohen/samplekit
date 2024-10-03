<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { LogoIcon } from '$lib/components';
	import I from '$lib/icons';
	import { OpenCartBtn } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';

	const {
		drawerProps: {
			elements: { trigger },
		},
	} = useNavService();
</script>

<nav
	class="sticky top-0 z-50 flex w-full items-center justify-between self-start overflow-hidden border-b border-gray-5 bg-app-bg p-2 px-page"
>
	<button use:melt={$trigger} class="btn btn-ghost animate-fade-up-and-in p-2" aria-label="Open navigation menu.">
		<I.Menu />
	</button>

	<a
		href="/shop"
		aria-label="go to shop home page"
		class="flex h-full items-center gap-2 rounded-none font-serif text-lg text-gray-12 dark:text-gray-12"
	>
		<LogoIcon svgClasses="h-6 w-6" />
		<span>Sample.Kit.Shop</span>
	</a>

	<div class="flex justify-end gap-3">
		<OpenCartBtn />
	</div>
</nav>
