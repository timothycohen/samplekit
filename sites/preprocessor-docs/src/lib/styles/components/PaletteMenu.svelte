<script lang="ts">
	import { fade } from 'svelte/transition';
	import { clickoutside, windowEscape } from '$lib/actions';
	import { KeyboardLoop, dropdownController } from '$lib/controllers';
	import { THEMES, useThemeControllerContext, Icon } from '$lib/styles';

	const themeController = useThemeControllerContext();
	const dropdown = dropdownController('#palette-menu > button:first-child');
</script>

<button id="palette-menu-btn" class="absolute inset-0" onclick={dropdown.toggle} aria-label="Toggle palette menu">
	<Icon icon="swatch" />
</button>

{#if dropdown.isOpen}
	<span
		id="palette-menu"
		in:fade={{ duration: 100 }}
		class="absolute left-2 top-8 rounded-card bg-accent-2 shadow-4"
		use:clickoutside={{ onOutclick: dropdown.close, immuneNodes: ['#palette-menu-btn'] }}
		use:windowEscape={dropdown.close}
	>
		{#each THEMES as theme, i}
			{@const active = themeController.theme.name === theme.name}
			<button
				class:rounded-t-card={i === 0}
				class:rounded-b-card={i === THEMES.length - 1}
				class:font-bold={active}
				class:underline={active}
				class:pt-4={i === 0}
				class:pb-4={i === THEMES.length - 1}
				class="btn w-full rounded-none p-2 px-4 decoration-accent-9 decoration-wavy underline-offset-4 -outline-offset-1"
				onclick={() => themeController.setTheme(theme.name)}
				use:KeyboardLoop.arrowKeys
			>
				{theme.name}
			</button>
		{/each}
	</span>
{/if}
