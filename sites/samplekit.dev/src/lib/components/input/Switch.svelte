<script lang="ts">
	export let id: string;
	export let state: boolean | null = null;
	export let onClick: () => void;

	export let defaultClasses =
		'bg-accent-5 data-[state=checked]:bg-accent-6 relative h-6 cursor-default rounded-full transition-colors border border-accent-7';
	export let classes = '';
</script>

<button
	class="group {defaultClasses} {classes}"
	{id}
	aria-labelledby="{id}-label"
	data-state={state === true ? 'checked' : null}
	type="button"
	role="switch"
	aria-checked={state === true}
	on:click={onClick}
>
	<span class="thumb {state ? 'bg-accent-9' : 'bg-accent-7'} block rounded-full transition"></span>
</button>

<input type="checkbox" checked={state === true} class="sr-only" aria-hidden="true" hidden={true} tabindex="-1" />

<style lang="postcss">
	button {
		--w: 2.75rem;
		--padding: 0.125rem;
		width: var(--w);
	}

	.thumb {
		--size: 1.25rem;
		width: var(--size);
		height: var(--size);
		transform: translateX(var(--padding));
	}

	[data-state='checked'] .thumb {
		transform: translateX(calc(var(--w) - var(--size) - var(--padding)));
	}
</style>
