<script lang="ts">
	interface Props { pattern: { id: string; transform: string } }

	let { pattern }: Props = $props();
</script>

<!-- https://componentland.com/component/login-page-1 -->
<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
	<defs>
		<pattern id={pattern.id} patternUnits="userSpaceOnUse" width="40" height="40" patternTransform={pattern.transform}>
			<rect x="0" y="0" width="100%" height="100%" fill="none" />
			<path
				d="M11 6a5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5 5 5 0 015 5"
				stroke-width="1"
				stroke="none"
				fill="currentColor"
			/>
		</pattern>
	</defs>
	<rect width="800%" height="800%" transform="translate(0,0)" fill="url(#{pattern.id})" />
</svg>
