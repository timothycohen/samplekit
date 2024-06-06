<script lang="ts" context="module">
	/**
	 * https://ogp.me
	 *
	 * https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/markup
	 */
	export type SEOMeta = {
		/**
		 * Used as the default for ogTitle, twitterTitle, ogImageAlt, twitterImageAlt
		 *
		 * Defaults to: 'SampleKit'
		 */
		title: string;
		ogTitle: string;
		twitterTitle: string;
		ogImageAlt: string;
		twitterImageAlt: string;

		/**
		 * Used as default for ogDescription and twitterDescription
		 *
		 * Defaults to: 'A resource for Svelte developers to learn and share common design patterns.'
		 */
		description: string;
		ogDescription: string;
		twitterDescription: string;

		ogImage: string;
		twitterImage: string;

		/** Defaults to: 'website' */
		ogType: string;
		/** Defaults to: $page.url.toString() */
		ogUrl: string;

		/** Defaults to: 'summary_large_image' */
		twitterCard: 'summary' | 'summary_large_image' | 'app' | 'player';
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855

	interface Props {
		meta?: Partial<SEOMeta>;
	}

	const { meta = {} }: Props = $props();

	const absolutePath = (path: string) => (path.startsWith('/') ? `${$page.url.origin}${path}` : path);
	const title = $derived(meta?.title ?? 'SampleKit');
	const description = $derived(
		meta?.description ?? 'A resource for Svelte developers to learn and share common design patterns.',
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={meta?.ogTitle ?? title} />
	<meta name="twitter:title" content={meta?.twitterTitle ?? title} />
	<meta property="og:image:alt" content={meta?.ogImageAlt ?? title} />
	<meta name="twitter:image:alt" content={meta?.twitterImageAlt ?? title} />

	<meta name="description" content={description} />
	<meta property="og:description" content={meta?.ogDescription ?? description} />
	<meta name="twitter:description" content={meta?.twitterDescription ?? description} />

	{#if meta?.ogImage}
		<meta property="og:image" content={absolutePath(meta.ogImage)} />
	{/if}
	{#if meta?.twitterImage}
		<meta property="og:image" content={absolutePath(meta.twitterImage)} />
	{/if}

	<meta property="og:type" content={meta?.ogType ?? 'website'} />
	<meta property="og:url" content={meta?.ogUrl ?? $page.url.toString()} />

	<meta name="twitter:card" content={meta?.twitterCard ?? 'summary_large_image'} />
	<!-- <meta name="twitter:site" content={''} />
	<meta name="twitter:creator" content={''} /> -->
</svelte:head>
