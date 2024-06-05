<script lang="ts">
	interface Props {
		class?: string;
		wrapperClasses?: string;
	}

	const { class: classes = 'bg-gray-12', wrapperClasses = '' }: Props = $props();

	const dots = 'mx-[1px] inline-block h-1 w-1 animate-blink rounded-full';
</script>

<span class="mx-2 inline-flex items-center {wrapperClasses}">
	<span class="{dots} {classes}"></span>
	<span class="{dots} animate-blink animation-delay-[200ms] {classes}"></span>
	<span class="{dots} animation-delay-[400ms] {classes}"></span>
</span>
