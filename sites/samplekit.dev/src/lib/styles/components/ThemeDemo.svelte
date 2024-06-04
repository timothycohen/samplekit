<script lang="ts">
	import { AlertTriangle, Check, Info, Moon, X } from '$lib/styles/icons';

	export let displayTheme: { name: string; scheme: 'light' | 'dark' };
</script>

<div data-theme={displayTheme.name} class="{displayTheme.scheme} pointer-events-none select-none">
	<div class="rounded-card overflow-hidden">
		<div
			class="rounded-card border-gray-6 bg-app-bg text-gray-12 relative aspect-video w-full overflow-hidden rounded-b-none border border-b-0"
		>
			<div class="bg-app-bg/80 absolute left-0 top-0 flex h-10 w-full items-center justify-between px-4">
				<span class="text-accent-9 text-sm font-bold">SampleKit</span>
				<div class="flex items-center gap-4">
					<span class="text-xs font-light">Profile</span>
					<Moon class="fill-amber-9 h-3 w-3 stroke-transparent" />
				</div>
			</div>
			<div class="absolute top-12 h-[calc(100%-3rem)] w-full px-[8%]">
				<div class="mt-[2%] grid h-[8%] grid-cols-3 gap-[2%]">
					<div class="shadow-3 rounded-card h-full text-center"></div>
					<div class="rounded-card bg-app-bg h-full text-center"></div>
				</div>

				<div class="mt-[4%] grid h-[60%] grid-cols-3 gap-[2%]">
					<div class="shadow-3 rounded-card col-start-1 col-end-3 h-full">
						<div class="bg-accent-9/25 border-accent-9 mt-[5%] flex h-[20%] w-full items-center border-l-2">
							<div class="bg-accent-9 ml-[10%] h-1/2 w-2/5 rounded-full"></div>
						</div>
					</div>
					<div class="shadow-3 rounded-card col-start-3 col-end-3 ml-[20%] grid h-[80%] p-[10%]">
						<div class="grid grid-cols-12">
							{#each [...Array(12).keys()].map((k) => k + 1) as i}
								<div style="background-color: hsl(var(--accent-{i}));" class="w-[10%]"></div>
							{/each}
						</div>
						<div class="flex items-center justify-around gap-[2%]">
							<X class="fill-error-5 stroke-error-9 w-[25%]" />
							<Info class="fill-info-5 stroke-info-9 w-[25%]" />
						</div>
						<div class="flex items-center justify-around gap-[2%]">
							<Check class="stroke-success-9 w-[25%]" />
							<AlertTriangle class="stroke-warning-10 w-[25%]" />
						</div>
					</div>
				</div>
			</div>
		</div>

		<p
			class="rounded-card border-gray-6 bg-app-bg text-gray-12 flex h-10 items-center rounded-t-none border px-4 font-bold capitalize"
		>
			{displayTheme.name}
		</p>
	</div>
</div>
