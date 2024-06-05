<script lang="ts">
	import FeatureCardContent from './FeatureCardContent.svelte';

	export let feature: {
		imgSm?: string;
		imgSmGif?: string;
		title: string;
		description: string;
		tags?: string[] | null;
		articleSlug: string;
		implementationSlug: string;
		srcCodeHref: string;
	};
	export let preview = false;

	const borderWrapperClass = `h-full from-accent-5/50 via-accent-6/50 to-accent-9/50 rounded-card p-px dark:bg-gradient-to-t sm:dark:bg-gradient-to-tr`;
	const innerClass = `overflow-hidden rounded-card from-gray-1 to-gray-2 shadow-2 hover:shadow-3 h-full bg-gradient-to-tr active:shadow-2 transition-shadow duration-500 ease-in hover:duration-200`;
</script>

<div class="@container {borderWrapperClass}">
	<div class="{innerClass} group flex flex-col">
		{#if feature.imgSm && feature.imgSmGif}
			<div class="aspect-video w-full bg-app-bg-amethyst">
				<img
					src={feature.imgSm}
					draggable="false"
					class="h-full w-full select-none rounded-card group-hover:hidden"
					alt=""
					loading={preview ? 'eager' : 'lazy'}
				/>
				<img src={feature.imgSmGif} class="hidden h-full w-full rounded-card group-hover:block" alt="" loading="lazy" />
			</div>
			<div class="my-2 h-px scale-x-90 bg-gray-5 transition-transform group-hover:scale-x-100"></div>
		{:else if feature.imgSm || feature.imgSmGif}
			<div class="aspect-video w-full bg-app-bg-amethyst">
				<img
					src={feature.imgSm || feature.imgSmGif}
					draggable="false"
					class="aspect-video h-full w-full scale-95 select-none rounded-card border-gray-6 transition-transform duration-500 group-hover:scale-100 group-hover:border-none group-hover:duration-200"
					alt=""
					loading={preview ? 'eager' : 'lazy'}
				/>
				<div class="h-px scale-x-90 bg-gray-5 transition-transform group-hover:scale-x-100"></div>
			</div>
		{/if}

		<FeatureCardContent {feature} />
	</div>
</div>
