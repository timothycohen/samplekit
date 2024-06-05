<script lang="ts">
	import { formatDate } from '$lib/utils/common';

	interface Props { updates: Array<{ at: Date; descriptions: string[] }> | undefined }

	let { updates }: Props = $props();
</script>

{#if updates && updates.length}
	<div>
		<h2>Changelog</h2>
		{#each updates as update}
			<h3>
				<time class="t-h4" datetime={update.at.toISOString()}>{formatDate(update.at)}</time>
			</h3>
			<ul>
				{#each update.descriptions as description}
					<li>{description}</li>
				{/each}
			</ul>
		{/each}
	</div>
{/if}
