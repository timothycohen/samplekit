<script lang="ts">
	import { useThemeControllerCtx, ThemeSwitchDayNightSystem } from '$lib/styles';
	import { keyboard } from '$lib/svelte-actions';

	const themeController = useThemeControllerCtx();

	type AfterMenuProps = { prev: (e: KeyboardEvent) => void; next: (e: KeyboardEvent) => void };
</script>

<span class="js-only block h-6 w-6 shrink-0 animate-[fadeIn_100ms_ease-in-out_forwards]">
	<ThemeSwitchDayNightSystem
		systemScheme={themeController.systemScheme}
		mode={themeController.mode}
		modeApplied={themeController.modeApplied}
		onModeChange={(mode) => themeController.setMode(mode, { animate: true })}
	>
		{#snippet afterMenu({ prev, next }: AfterMenuProps)}
			<a
				tabindex="-1"
				href="/appearance"
				class="flex items-center rounded-b-card p-2 pl-4 text-xs font-light text-gray-11 decoration-accent-6 underline-offset-2 hover:bg-gray-4 hover:underline focus-visible:bg-gray-4"
				use:keyboard={{ ArrowUp: [prev], ArrowDown: [next] }}
			>
				Customize appearance
			</a>
		{/snippet}
	</ThemeSwitchDayNightSystem>
</span>
