<script lang="ts">
	import { formatDate } from '$lib/utils/common';

	interface Props { publishedAt: Date, lastUpdate: { at: Date } | undefined }

	let { publishedAt, lastUpdate }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<dl class="flex text-xs font-bold uppercase tracking-wider text-gray-11">
		<dt>Published</dt>
		<span class="mx-2 text-gray-10" aria-hidden="true">•</span>
		<dd>
			<time datetime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
		</dd>
	</dl>

	<span class="mx-2 h-px flex-1 bg-gray-9"></span>

	{#if lastUpdate}
		<dl class="flex text-xs font-bold uppercase tracking-wider text-gray-11">
			<dt>Last Updated</dt>
			<span class="mx-2 text-gray-10" aria-hidden="true">•</span>
			<dd>
				<time datetime={lastUpdate.at.toISOString()}>{formatDate(lastUpdate.at)}</time>
			</dd>
		</dl>
	{/if}
</div>
