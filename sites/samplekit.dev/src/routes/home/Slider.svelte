<script lang="ts">
	import { fade } from 'svelte/transition';
	import { ScrollIndicator } from '$lib/components';
	import I from '$lib/icons';
	import { AccordionSlider } from '$lib/svelte-stores';

	import auth_1420_jpeg from './assets/auth-1420w.jpeg';
	import auth_1420_webp from './assets/auth-1420w.webp';
	import auth_850_jpeg from './assets/auth-850w.jpeg';
	import auth_850_webp from './assets/auth-850w.webp';
	import aws_1420_jpeg from './assets/aws-1420w.jpeg';
	import aws_1420_webp from './assets/aws-1420w.webp';
	import aws_850_jpeg from './assets/aws-850w.jpeg';
	import aws_850_webp from './assets/aws-850w.webp';
	import commerce_1420_jpeg from './assets/e-commerce-1420w.jpeg';
	import commerce_1420_webp from './assets/e-commerce-1420w.webp';
	import commerce_850_jpeg from './assets/e-commerce-850w.jpeg';
	import commerce_850_webp from './assets/e-commerce-850w.webp';
	import hosting_1420_jpeg from './assets/self-hosting-1420w.jpeg';
	import hosting_1420_webp from './assets/self-hosting-1420w.webp';
	import hosting_850_jpeg from './assets/self-hosting-850w.jpeg';
	import hosting_850_webp from './assets/self-hosting-850w.webp';

	const items = [
		{
			title: 'Auth',
			source1: { srcset: `${auth_1420_webp} 1420w, ${auth_850_webp} 850w`, type: 'image/webp' },
			source2: { srcset: `${auth_1420_jpeg} 1420w, ${auth_850_jpeg} 850w`, type: 'image/jpeg' },
			img: { src: auth_1420_jpeg },
		},
		{
			title: 'AWS',
			description: '',
			source1: { srcset: `${aws_1420_webp} 1420w, ${aws_850_webp} 850w`, type: 'image/webp' },
			source2: { srcset: `${aws_1420_jpeg} 1420w, ${aws_850_jpeg} 850w`, type: 'image/jpeg' },
			img: { src: aws_1420_jpeg },
		},
		{
			title: 'E-Commerce',
			source1: { srcset: `${commerce_1420_webp} 1420w, ${commerce_850_webp} 850w`, type: 'image/webp' },
			source2: { srcset: `${commerce_1420_jpeg} 1420w, ${commerce_850_jpeg} 850w`, type: 'image/jpeg' },
			img: { src: commerce_1420_jpeg },
		},
		{
			title: 'Self Hosting',
			source1: { srcset: `${hosting_1420_webp} 1420w, ${hosting_850_webp} 850w`, type: 'image/webp' },
			source2: { srcset: `${hosting_1420_jpeg} 1420w, ${hosting_850_jpeg} 850w`, type: 'image/jpeg' },
			img: { src: hosting_1420_jpeg },
		},
	];

	let windowWidth = $state(768);
	const slider = new AccordionSlider({
		defaultActiveIndex: 0,
		duration: 15000,
		playOnStart: true,
		itemsLength: items.length,
		initialParentWidth: 768,
		gapPerc: 2,
		marginPerc: 4,
	});
</script>

<svelte:window bind:innerWidth={windowWidth} />

{#snippet Selector()}
	<div class="relative z-0 grid grid-cols-2">
		{#each items as { title }, i}
			<div
				{...slider.elAccordionTrigger(i, 'nothing')}
				class="z-10 border-2 bg-gray-2 p-4 text-left -outline-offset-1 transition-all {slider.activeIndex === i
					? 'border-accent-9/10 bg-gray-3'
					: 'border-transparent'}"
			>
				<span class="block text-xs font-light {i === 0 || i === 2 ? 'text-left' : 'text-right'}">0{i + 1}.</span>
				<h2 class="font-medium {i === 0 || i === 2 ? 'text-left' : 'text-right'}">{title}</h2>
			</div>
		{/each}

		<div class="absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden">
			<div class="z-10 aspect-square h-1/2 rotate-0">
				<button
					onclick={slider.togglePause}
					aria-label="Play"
					class="play-btn-container"
					style="--progress: {slider.progress}%;"
				>
					{#if !slider.moving}
						<div class="absolute inset-0 flex items-center justify-center" out:fade={{ duration: 150, delay: 150 }}>
							{#if slider.isPaused}
								<I.Play class="h-5 w-5" />
							{:else}
								<I.Pause class="h-5 w-5" />
							{/if}
						</div>
					{/if}
				</button>
			</div>
		</div>
	</div>
{/snippet}

{#snippet Slider()}
	<div class="-my-8 overflow-hidden py-8" use:slider.bindParentWidth>
		<div
			{...slider.elSliderRoot}
			class="flex h-full w-full touch-pan-x transition-transform duration-[400ms] motion-reduce:duration-0"
		>
			{#each items as { source1, source2, img }, i}
				<div
					{...slider.elSliderItem}
					class="aspect-[1420/1004] flex-shrink-0 rounded-card transition-all
						{slider.activeIndex === i ? 'shadow-4' : slider.activeIndex > i ? 'shadow-3 xl:shadow-none' : 'shadow-3'}"
				>
					<picture>
						<source {...source1} />
						<source {...source2} />
						<img
							src={img.src}
							alt=""
							width="1420"
							height="1004"
							loading={i === 0 ? 'eager' : 'lazy'}
							draggable="false"
							class="w-screen select-none rounded-card object-contain transition-opacity duration-[400ms]
						{slider.activeIndex === i ? 'opacity:100' : slider.activeIndex > i ? 'opacity-10 xl:opacity-0' : 'opacity-10'}"
						/>
					</picture>
				</div>
			{/each}
		</div>
	</div>

	<ScrollIndicator onAboveViewport={() => slider.reset()} />
{/snippet}

{#snippet FeatureLI(text: string)}
	<li class="flex items-center gap-2 text-lg"><I.Zap class="h-4 w-4 shrink-0 fill-amber-9" />{text}</li>
{/snippet}

{#snippet Content()}
	<div class="mt-4 px-page xl:px-3">
		{#if items[slider.activeIndex]!.title === 'E-Commerce'}
			<p class="mb-4 text-center text-lg">Integrate an e-commerce store directly in your SvelteKit app.</p>
			<p class="mb-4">
				The Shop demo uses the <a data-external class="link" href="https://shopify.dev/docs/api/storefront">
					Shopify Storefront API
				</a>
				to replicate the features of
				<a data-external class="link" href="https://github.com/vercel/commerce">Next.js Commerce</a> in SvelteKit.
			</p>
			<p>
				Naturally, the lib and UI are separated, so you can satisfy the interface using Medusa or your preferred
				commerce platform.
			</p>
		{:else if items[slider.activeIndex]!.title === 'AWS'}
			<p class="mb-4 text-center text-lg">Integrate Amazon Web Services into your SvelteKit app.</p>
			<p class="mb-4">
				The image uploader demo was made to guide the integration of a few irreplacable AWS services into your SvelteKit
				app. It uses S3 for image storage, Rekognition for content moderation, and Cloudfront for delivery.
			</p>
			<p>Combine this with a rate limiter and front end image cropper, and you've got a full avatar creation tool.</p>
		{:else if items[slider.activeIndex]!.title === 'Self Hosting'}
			<p class="mb-4 text-center text-lg">Run your own server with full control.</p>
			<p class="mb-4">
				SampleKit showcases how to run SvelteKit on <code>adapter-node</code> or <code>adapter-static</code>
				using CapRover and Docker swarm. Easily dockerize and deploy databases, kv storage, cron jobs, log streams, node
				apps, nginx sites, and anything else the heart desires or the project demands. Add GitHub actions for a smooth DevOps
				experience.
			</p>
			<p>
				While Netlify and Vercel offer unparalleled DevOps, they demand multiple serverless services for even a simple
				app. Notably, Netlify also
				<a
					data-external
					class="link"
					href="https://docs.netlify.com/accounts-and-billing/billing-faq/#can-i-set-a-limit-on-my-usage"
				>
					doesn't have spend limits
				</a>
				and this has led to
				<a data-external class="link" href="https://news.ycombinator.com/item?id=39520776">unpredictable bills</a>.
			</p>
		{:else if items[slider.activeIndex]!.title === 'Auth'}
			<p class="mb-4 text-center text-lg">Everything you need for Auth in one place.</p>
			<ul class="grid h-full list-none gap-0.5">
				{@render FeatureLI('Email/Pass or OAuth (Google)')}
				{@render FeatureLI('Email Verification')}
				{@render FeatureLI('Session Management')}
				{@render FeatureLI('SMS/Passkey/Authenticator')}
				{@render FeatureLI('Security Notification Emails')}
				{@render FeatureLI('Password Reset')}
				{@render FeatureLI('Server Authentication Hooks')}
				{@render FeatureLI('Bot Protection')}
				{@render FeatureLI('Rate Limiting')}
				{@render FeatureLI('Account Deletion')}
			</ul>
		{/if}
	</div>
{/snippet}

<div class="space-y-8 xl:hidden">
	{@render Slider()}
	{@render Selector()}
	{@render Content()}
</div>

<div class="hidden grid-cols-[6fr_17fr] xl:grid">
	<div class="z-10 -mr-8 overflow-hidden rounded-card rounded-l-none border border-gray-4 bg-app-bg">
		{@render Selector()}
		{@render Content()}
	</div>
	{@render Slider()}
</div>

<style lang="postcss">
	.play-btn-container {
		@apply absolute inset-0 rounded-[20%] bg-accent-9/10;
	}
	.play-btn-container::before {
		@apply absolute inset-0.5 z-0 block rounded-[20%] bg-app-bg content-[''];
	}
	.play-btn-container::after {
		@apply absolute inset-0 -z-10 block rounded-[20%] content-[''];
		background: conic-gradient(hsl(var(--accent-9)), hsl(var(--accent-9)) var(--progress), transparent var(--progress));
	}
</style>
