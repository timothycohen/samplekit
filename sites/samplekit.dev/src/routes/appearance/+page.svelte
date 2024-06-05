<script lang="ts">
	import { ThemePicker, themeController, THEMES } from '$lib/styles';
	themeController; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855

	const optionsArr = ['fixed_day', 'fixed_night', 'sync_system'] as const;
	const tsCast = (str: string) => str as (typeof optionsArr)[number];
</script>

<section class="space-y-6">
	<h1 class="text-h4">Appearance</h1>

	<fieldset>
		<legend class="mb-2 text-lg font-bold">When should we use your themes?</legend>
		<span class="space-y-1">
			{#each optionsArr as value}
				{@const checked = $themeController.mode === value}
				<span class="flex items-center gap-2">
					<input
						type="radio"
						class="radio"
						id={value}
						{value}
						{checked}
						onclick={(e) => themeController.setMode(tsCast(e.currentTarget.value))}
					/>
					<label for={value}>
						<span class={checked ? '' : 'font-light text-gray-10'}>
							{#if value === 'fixed_day'}Always use day theme
							{:else if value === 'fixed_night'}Always use night theme
							{:else}Sync with system (currently {$themeController.schemeSystem === 'dark' ? 'night' : 'day'})
							{/if}
						</span>
					</label>
				</span>
			{/each}
		</span>
	</fieldset>

	<div class="text-lg font-bold">Choose your day and night themes.</div>

	<div class="grid grid-cols-1 gap-x-4 gap-y-8 min-[1130px]:grid-cols-2">
		<ThemePicker
			mode="day"
			preference={$themeController.themeDay}
			active={$themeController.modeApplied === 'day'}
			setTheme={(e) => themeController.setTheme(e)}
			themes={THEMES}
		/>
		<ThemePicker
			mode="night"
			preference={$themeController.themeNight}
			active={$themeController.modeApplied === 'night'}
			setTheme={(e) => themeController.setTheme(e)}
			themes={THEMES}
		/>
	</div>
</section>
