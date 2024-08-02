<script lang="ts">
	import I from '$lib/icons';

	interface Props {
		displayTheme: { name: string; scheme: 'light' | 'dark' };
	}

	const { displayTheme }: Props = $props();
</script>

<div data-theme={displayTheme.name} class="{displayTheme.scheme} pointer-events-none select-none">
	<div class="overflow-hidden rounded-card">
		<div
			class="relative aspect-video w-full overflow-hidden rounded-card rounded-b-none border border-b-0 border-gray-6 bg-app-bg text-gray-12"
		>
			<div class="absolute left-0 top-0 flex h-10 w-full items-center justify-between bg-app-bg/80 px-4">
				<span class="text-sm font-bold text-accent-9">SampleKit</span>
				<div class="flex items-center gap-4">
					<span class="text-xs font-light">Profile</span>
					<I.Moon class="h-3 w-3 fill-amber-9 stroke-transparent" />
				</div>
			</div>
			<div class="absolute top-12 h-[calc(100%-3rem)] w-full px-[8%]">
				<div class="mt-[2%] grid h-[8%] grid-cols-3 gap-[2%]">
					<div class="h-full rounded-card text-center shadow-3"></div>
					<div class="h-full rounded-card bg-app-bg text-center"></div>
				</div>

				<div class="mt-[4%] grid h-[60%] grid-cols-3 gap-[2%]">
					<div class="col-start-1 col-end-3 h-full rounded-card shadow-3">
						<div class="mt-[5%] flex h-[20%] w-full items-center border-l-2 border-accent-9 bg-accent-9/25">
							<div class="ml-[10%] h-1/2 w-2/5 rounded-full bg-accent-9"></div>
						</div>
					</div>
					<div class="col-start-3 col-end-3 ml-[20%] grid h-[80%] rounded-card p-[10%] shadow-3">
						<div class="grid grid-cols-12">
							{#each [...Array(12).keys()].map((k) => k + 1) as i}
								<div style="background-color: hsl(var(--accent-{i}));" class="w-[10%]"></div>
							{/each}
						</div>
						<div class="flex items-center justify-around gap-[2%]">
							<I.X class="w-[25%] fill-error-5 stroke-error-9" />
							<I.Info class="w-[25%] fill-info-5 stroke-info-9" />
						</div>
						<div class="flex items-center justify-around gap-[2%]">
							<I.Check class="w-[25%] stroke-success-9" />
							<I.TriangleAlert class="w-[25%] stroke-warning-10" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<p
			class="flex h-10 items-center rounded-card rounded-t-none border border-gray-6 bg-app-bg px-4 font-bold capitalize text-gray-12"
		>
			{displayTheme.name}
		</p>
	</div>
</div>
