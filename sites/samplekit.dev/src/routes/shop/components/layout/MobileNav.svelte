<script lang="ts">
	import { melt } from '@melt-ui/svelte';
	import { MenuIcon } from '$lib/styles/icons';
	import { OpenCartBtn } from '$routes/shop/components';
	import { useNavService } from '$routes/shop/services';

	const {
		drawerProps: {
			elements: { trigger },
		},
	} = useNavService();
</script>

<nav
	class="bg-app-bg border-gray-5 px-page sticky top-0 z-50 flex w-full items-center justify-between self-start overflow-hidden border-b p-2"
>
	<button use:melt={$trigger} class="animate-fade-up-and-in btn-ghost btn p-2">
		<MenuIcon />
	</button>

	<a href="/shop" aria-label="go to shop home page" class="text-logo text-lg font-black tracking-tight"> SampleKit </a>

	<div class="flex justify-end gap-3">
		<OpenCartBtn />
	</div>
</nav>
