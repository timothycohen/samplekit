<script lang="ts">
	import { ThemePicker, THEMES, useThemeControllerCtx } from '$lib/styles';

	const optionsArr = ['fixed_day', 'fixed_night', 'sync_system'] as const;
	const tsCast = (str: string) => str as (typeof optionsArr)[number];
	const themeController = useThemeControllerCtx();
</script>

<section class="space-y-6">
	<h1 class="text-h4">Appearance</h1>

	<noscript>
		<div class="alert-wrapper alert-wrapper-warning mt-6">Please enable JavaScript to continue.</div>
	</noscript>

	<div class="js-only space-y-6">
		<fieldset>
			<legend class="mb-2 text-lg font-bold">When should we use your themes?</legend>
			<span class="space-y-1">
				{#each optionsArr as value}
					{@const checked = themeController.mode === value}
					<span class="flex items-center gap-2">
						<input
							type="radio"
							class="radio"
							name="mode"
							id={value}
							{value}
							{checked}
							onclick={(e) => (themeController.mode = tsCast(e.currentTarget.value))}
						/>
						<label for={value}>
							<span class={checked ? '' : 'font-light text-gray-10'}>
								{#if value === 'fixed_day'}Always use day theme
								{:else if value === 'fixed_night'}Always use night theme
								{:else}Sync with system
									<span class="showDay">(currently day)</span>
									<span class="showNight">(currently night)</span>
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
				preference={themeController.themeDay}
				active={themeController.initializedOnClient && themeController.modeApplied === 'day'}
				setTheme={(e) => themeController.setTheme({ ...e, animate: false })}
				themes={THEMES}
			/>
			<ThemePicker
				mode="night"
				preference={themeController.themeNight}
				active={themeController.initializedOnClient && themeController.modeApplied === 'night'}
				setTheme={(e) => themeController.setTheme({ ...e, animate: false })}
				themes={THEMES}
			/>
		</div>
	</div>
</section>
