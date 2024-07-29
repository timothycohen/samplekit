<script lang="ts">
	import { onMount } from 'svelte';
	import { beforeNavigate, afterNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { ArrowLeft, ArrowRight } from '$lib/styles/icons';
	import { DesktopNav, Sidebar, MobileNav, Cart } from '$routes/shop/components';
	import {
		createSearchAndFilterService,
		useSearchAndFilterService,
		createNavService,
		useNavService,
		createCartService,
	} from '$routes/shop/services';

	createSearchAndFilterService();
	createNavService();
	createCartService();

	const { reset, pullFromUrl } = useSearchAndFilterService();
	const { closeOnNavListener } = useNavService();

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
					<ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
					Back to SampleKit
				</a>
			</div>

			<div class="flex justify-end">
				<a href="https://demo.vercel.store" class="group btn-sizing link p-2 text-accent-12">
					Layout from Vercel Commerce
					<ArrowRight class="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
		<ArrowLeft class="h-4 w-4 transition-transform group-hover:-translate-x-1" />
		Leave Demo
	</a>
</footer>
