<script lang="ts">
	import { searchParam } from '$lib/stores';

	export let option: {
		name: string;
		clean: string;
		values: {
			name: string;
			clean: string;
			available: boolean;
		}[];
	};

	const param = searchParam(option.clean);
</script>

<dl class="mb-8">
	<dt class="mb-4 text-sm uppercase tracking-wide">{option.name}</dt>
	<dd class="flex flex-wrap gap-3">
		{#each option.values as { name, clean, available } (clean)}
			{@const isActive = $param === clean}
			<button
				on:click={() => {
					if (!available) return;
					param.toggle(clean);
				}}
				class="flex min-w-12 items-center justify-center rounded-btn px-2 py-1 text-sm outline-offset-0 transition-all focus-visible:outline-offset-2 focus-visible:outline-accent-9
				{!available
					? 'btn-disabled relative z-10 overflow-hidden before:absolute before:inset-3 before:-z-10 before:h-px before:-rotate-45 before:bg-gray-8 before:transition-transform'
					: isActive
						? 'bg-accent-4 text-accent-12 outline outline-2 outline-accent-9'
						: 'bg-gray-4 text-gray-12 outline outline-1 outline-gray-5 hover:scale-105 hover:outline-accent-9'}
				"
			>
				{name}
			</button>
		{/each}
	</dd>
</dl>
