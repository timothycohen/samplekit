import type { ComponentType, SvelteComponent } from 'svelte';

export * from './result';

export type NoPropComponent = ComponentType<
	SvelteComponent<Record<string, never>, Record<string, never>, Record<string, never>>
>;
