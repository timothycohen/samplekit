<script lang="ts">
	import { formatDate } from '$lib/utils/common';

	export let publishedAt: Date;
	export let lastUpdate: { at: Date } | undefined;
</script>

<div class="flex flex-wrap items-center justify-between gap-3">
	<dl class="text-gray-11 flex text-xs font-bold uppercase tracking-wider">
		<dt>Published</dt>
		<span class="text-gray-10 mx-2" aria-hidden="true">•</span>
		<dd>
			<time datetime={publishedAt.toISOString()}>{formatDate(publishedAt)}</time>
		</dd>
	</dl>

	<span class="bg-gray-9 mx-2 h-px flex-1"></span>

	{#if lastUpdate}
		<dl class="text-gray-11 flex text-xs font-bold uppercase tracking-wider">
			<dt>Last Updated</dt>
			<span class="text-gray-10 mx-2" aria-hidden="true">•</span>
			<dd>
				<time datetime={lastUpdate.at.toISOString()}>{formatDate(lastUpdate.at)}</time>
			</dd>
		</dl>
	{/if}
</div>
