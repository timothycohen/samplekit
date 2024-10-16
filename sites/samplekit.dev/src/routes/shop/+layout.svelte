<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import I from '$lib/icons';
	import { DesktopNav, Sidebar, MobileNav, Cart } from '$routes/shop/lib/components';
	import {
		createSearchAndFilterCtx,
		useSearchAndFilterCtx,
		createNavCtx,
		useNavCtx,
		createCartCtx,
	} from '$routes/shop/lib/ctx';

	createSearchAndFilterCtx();
	createNavCtx();
	createCartCtx();

	const { reset, pullFromUrl } = useSearchAndFilterCtx();
	const { closeOnNavListener } = useNavCtx();

	onMount(() => {
		const { destroy } = closeOnNavListener();

		return () => {
			destroy();
		};
	});

	beforeNavigate((e) => {
		if (e.from?.url.pathname !== e.to?.url.pathname) {
			reset({ skipGo: true });
		}
	});

	afterNavigate((e) => {
		if (e.from?.url.pathname !== e.to?.url.pathname) {
			pullFromUrl();
		}
	});

	const { data, children } = $props();
</script>

<div class="full">
	{#if $page.url.pathname === '/shop'}
		<div class="grid grid-cols-2 gap-2 bg-accent-3 px-2 text-sm">
			<div class="flex justify-start">
				<a href="/" class="group btn-sizing link p-2 text-accent-12">
					<I.ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
					Back to SampleKit
				</a>
			</div>

			<div class="flex justify-end">
				<a href="https://demo.vercel.store" class="group btn-sizing link p-2 text-accent-12">
					Layout from Vercel Commerce
					<I.ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
				</a>
			</div>
		</div>
	{/if}

	<div class="hidden lg:contents">
		<DesktopNav menu={data.menu} collections={data.collections} />
	</div>
	<div class="contents lg:hidden">
		<MobileNav />
	</div>

	<Sidebar collections={data.collections} />
	<Cart />

	{@render children()}
</div>

<footer class="mt-8">
	<a href="/" class="group btn btn-ghost p-2 text-sm">
		<I.ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
		Leave Demo
	</a>
</footer>
