<script lang="ts">
	import { onMount } from 'svelte';
	import { clickOn } from '$lib/actions';
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

	let labelEl: HTMLLabelElement;
	let frontEl: HTMLDivElement;
	let backEl: HTMLDivElement;

	onMount(() => {
		if (preview && !localStorage.getItem('preview_seen')) {
			const previousDuration = 500;
			const duration = 800;

			labelEl.classList.add('preview');
			[frontEl, backEl].forEach((e) => (e.style.transitionDuration = `${duration}ms`));
			setTimeout(() => {
				labelEl.classList.remove('preview');
				localStorage.setItem('preview_seen', 'true');
				checked = true;
				setTimeout(() => {
					[frontEl, backEl].forEach((e) => (e.style.transitionDuration = `${previousDuration}ms`));
					checked = false;
				}, 1500);
			}, duration);
		}
	});

	let checked = false;

	const borderWrapperClass = `h-full from-accent-5/50 via-accent-6/50 to-accent-9/50 rounded-card p-px dark:bg-gradient-to-t sm:dark:bg-gradient-to-tr
	transition-transform duration-500 ease-in-out peer-focus-visible:outline`;
	const innerClass = `overflow-hidden rounded-card from-gray-1 to-gray-2 shadow-2 hover:shadow-3 h-full bg-gradient-to-tr active:shadow-2 transition-shadow duration-500 ease-in hover:duration-200`;
</script>

<label
	bind:this={labelEl}
	class="swap-flip tilt-wrapper @container relative cursor-pointer"
	use:clickOn={['Enter']}
	aria-label="View example picture."
>
	<input type="checkbox" class="peer sr-only" bind:checked />

	<div bind:this={frontEl} class="{borderWrapperClass} swap-front h-full">
		<div class={innerClass}>
			<span class="tilt-tracker absolute inset-0">
				<span class="absolute left-0 top-0 h-full w-1/3"></span>
				<span class="absolute right-0 top-0 h-full w-1/3"></span>
			</span>

			<FeatureCardContent {feature} tabindex={checked ? -1 : 0} />
		</div>
	</div>

	<div bind:this={backEl} class="{borderWrapperClass} swap-back absolute inset-0" title={feature.title}>
		<div class={innerClass}>
			<span class="tilt-tracker absolute inset-0">
				<span class="absolute left-0 top-0 h-full w-1/3"></span>
				<span class="absolute right-0 top-0 h-full w-1/3"></span>
			</span>

			<img
				src={feature.imgSmGif ?? feature.imgSm}
				class="bg-app-bg-amethyst h-full w-full object-contain object-center"
				alt=""
				loading={preview ? 'eager' : 'lazy'}
				draggable="false"
			/>
		</div>
	</div>
</label>

<style lang="postcss">
	.tilt-wrapper {
		transition: transform 400ms cubic-bezier(0.25, 0, 0.2, 1);
	}
	.tilt-wrapper:has(.tilt-tracker > span:nth-child(1):active) {
		transform: rotateY(-15deg);
	}
	.tilt-wrapper:active:has(.tilt-tracker > span:nth-child(2):active) {
		transform: rotateY(15deg);
	}
</style>
