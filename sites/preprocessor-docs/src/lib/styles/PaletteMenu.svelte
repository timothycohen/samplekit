<script lang="ts">
	import { fade } from 'svelte/transition';
	import { clickoutside, windowEscape } from '$lib/actions';
	import { KeyboardLoop, dropdownController } from '$lib/controllers';
	import I from '$lib/icons';
	import { ThemeController, type Theme } from '$lib/styles';

	const { themeController }: { themeController: ThemeController } = $props();
	const dropdown = dropdownController('#palette-menu > button:first-child');
</script>

<div class="js-only relative h-6 w-6">
	<button id="palette-menu-btn" onclick={dropdown.toggle} aria-label="Toggle palette menu">
		<I.SwatchBook class="rounded-full transition-colors" fill="var(--fill-color, transparent)" />
	</button>

	{#if dropdown.isOpen}
		{@const classes = (theme: Theme['name']) =>
			`${theme === themeController.theme ? 'underline' : ''} ${theme} btn w-28 rounded-none p-2 px-4 decoration-accent-9 decoration-wavy underline-offset-4 -outline-offset-1`}
		<span
			id="palette-menu"
			in:fade={{ duration: 100 }}
			class="absolute left-2 top-8 rounded-[4px] bg-accent-2 shadow-4"
			use:clickoutside={{ onOutclick: dropdown.close, immuneNodes: ['#palette-menu-btn'] }}
			use:windowEscape={dropdown.close}
		>
			<button
				use:KeyboardLoop.arrowKeys
				class="rounded-t-[4px] {classes('amethyst')}"
				onclick={() => (themeController.theme = 'amethyst')}
			>
				amethyst
			</button>
			<button
				use:KeyboardLoop.arrowKeys
				class={classes('bellflower')}
				onclick={() => (themeController.theme = 'bellflower')}
			>
				bellflower
			</button>
			<button use:KeyboardLoop.arrowKeys class={classes('desert')} onclick={() => (themeController.theme = 'desert')}>
				desert
			</button>
			<button
				use:KeyboardLoop.arrowKeys
				class="rounded-b-[4px] {classes('daffodil')}"
				onclick={() => (themeController.theme = 'daffodil')}
			>
				daffodil
			</button>
		</span>
	{/if}
</div>

<style lang="postcss">
	.amethyst {
		background: hsl(var(--iris-3-dark));
		color: hsl(var(--iris-12-dark));
	}
	#palette-menu-btn:global(:has(+ #palette-menu .amethyst:hover)) {
		--fill-color: hsl(var(--iris-7-dark));
	}

	.bellflower {
		background: hsl(var(--iris-3-light));
		color: hsl(var(--iris-12-light));
	}
	#palette-menu-btn:global(:has(+ #palette-menu .bellflower:hover)) {
		--fill-color: hsl(var(--iris-7-light));
	}

	.desert {
		background: hsl(var(--amber-3-dark));
		color: hsl(var(--amber-12-dark));
	}
	#palette-menu-btn:global(:has(+ #palette-menu .desert:hover)) {
		--fill-color: hsl(var(--amber-7-dark));
	}

	.daffodil {
		background: hsl(var(--amber-3-light));
		color: hsl(var(--amber-12-light));
	}
	#palette-menu-btn:global(:has(+ #palette-menu .daffodil:hover)) {
		--fill-color: hsl(var(--amber-7-light));
	}
</style>
