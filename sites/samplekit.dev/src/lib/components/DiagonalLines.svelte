<script lang="ts">
	export let svgClasses = 'h-full w-full bg-accent-9';
	export let lineColor = '#9C92AC';
	export let lineOpacity = '0.4';
	export let width = '6';
	export let height = '6';

	const id = `pattern-${Math.random().toString(36).substring(2, 15)}`;
</script>

<!-- https://heropatterns.com/ -->
<svg class={svgClasses} xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
	<defs>
		<pattern {id} {width} {height} patternUnits="userSpaceOnUse">
			<g fill={lineColor} fill-opacity={lineOpacity} fill-rule="evenodd">
				<path d="M5 0h1L0 6V5zM6 5v1H5z" />
			</g>
		</pattern>
	</defs>
	<rect width="100%" height="100%" fill="url(#{id})" />
</svg>
