<script lang="ts">
	export let series:
		| {
				position: number;
				name: string;
				all: { title: string; articleSlug: string; position: number }[];
		  }
		| undefined;
</script>

{#if series}
	<div class="lg:w-80">
		<span class="block lg:hidden">
			<h2 class="t-h3 mb-2 font-bold">
				This is part {series.position} of {series.all.length} in the
				{series.name} series.
			</h2>
		</span>
		<span class="hidden lg:block">
			<h2 class="t-h3 mb-2 w-80 font-bold text-accent-12">{series.name}</h2>
			<p class="text-gray-12">
				Part {series.position} of {series.all.length} in the {series.name} series.
			</p>
		</span>

		<div class="mb-6 h-px w-full bg-gray-9"></div>
		<ul class="space-y-1">
			{#each series.all as item}
				{@const active = series.position === item.position}
				{#if active}
					<li aria-current="step" class="group">
						<span>0{item.position}.</span>
						<span class="group-aria-[current='step']:text-accent-11">{item.title}</span>
					</li>
				{:else}
					<li class="group">
						<a href={item.articleSlug} class="group">
							<span>0{item.position}.</span>
							<span class="underline--hidden group-hover:underline--show">{item.title}</span>
						</a>
					</li>
				{/if}
			{/each}
		</ul>
	</div>
{/if}
