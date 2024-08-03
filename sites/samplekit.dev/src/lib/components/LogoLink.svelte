<script lang="ts">
	import LogoIcon from './LogoIcon.svelte';

	interface Props {
		onAnchorClick?: (() => void) | undefined;
		iconClass?: string;
		textClass?: string;
	}

	const { onAnchorClick = undefined, iconClass, textClass }: Props = $props();
</script>

<a
	href="/"
	onclick={onAnchorClick}
	aria-label="go to home page"
	class="flex h-full items-center gap-2 rounded-none font-serif text-2xl text-gray-12 dark:text-gray-12"
>
	<span class={iconClass}><LogoIcon /></span>
	<span class={textClass}>Sample.Kit</span>
</a>
