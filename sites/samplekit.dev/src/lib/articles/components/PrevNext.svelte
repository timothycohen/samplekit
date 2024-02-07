<script lang="ts">
	import { ArrowBigDown, ArrowBigUp } from 'lucide-svelte';

	export let prev: { slug: string; title: string } | null;
	export let next: { slug: string; title: string } | null;
</script>

{#if prev || next}
	<div class="w-full font-medium">
		{#if prev && next}
			<dl>
				<dt class="flex items-center"><ArrowBigUp />Previous post</dt>
				<a class="link" href="/articles/{prev.slug}">{prev.title}</a>
				<dt class="flex items-center"><ArrowBigDown />Next post</dt>
				<a class="link" href="/articles/{next.slug}">{next.title}</a>
			</dl>
		{:else if prev}
			<dl>
				<dt class="flex items-center"><ArrowBigUp />Previous post</dt>
				<a class="link" href="/articles/{prev.slug}">{prev.title}</a>
			</dl>
		{:else if next}
			<dl>
				<dt class="flex items-center"><ArrowBigDown />Next post</dt>
				<a class="link" href="/articles/{next.slug}">{next.title}</a>
			</dl>
		{/if}
	</div>
{/if}
