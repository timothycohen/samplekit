<script lang="ts">
	export let entry: { title: string; url: string };
	export let current: (url: string) => 'page' | undefined;
</script>

<li>
	<a
		aria-current={current(entry.url)}
		href={entry.url}
		class="underline--hidden before:bottom-[.175rem]
					before:h-[.35rem] hover:text-accent-12 hover:before:w-full
					 aria-[current='page']:pointer-events-none aria-[current='page']:before:w-full"
	>
		{entry.title}
	</a>
</li>
