<script lang="ts">
	let classes = 'bg-gray-12';
	export { classes as class };
	export let wrapperClasses = '';

	const dots = 'mx-[1px] inline-block h-1 w-1 animate-blink rounded-full';
</script>

<span class="mx-2 inline-flex items-center {wrapperClasses}">
	<span class="{dots} {classes}"></span>
	<span class="{dots} animation-delay-[200ms] animate-blink {classes}"></span>
	<span class="{dots} animation-delay-[400ms] {classes}"></span>
</span>
