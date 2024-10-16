import type { Component } from 'svelte';

export type DemoComponent = Component;
export type WrapperProps = { bg?: true; center?: true; noBorder?: true; noPadding?: true };

export type CodeDefined = {
	title: string;

	loadRaw: () => Promise<unknown>;
	lang?: string;

	loadComponent?: never;
	wrapperProps?: never;
	icon?: never;
};

export type ComponentDefined = {
	title: string;

	loadRaw?: never;
	lang?: never;

	loadComponent: () => Promise<unknown>;
	wrapperProps?: WrapperProps;
	icon?: 'svelte';
};

export type ModuleDefinitions = Array<ComponentDefined | CodeDefined>;

type CodeProcessedBase = {
	index: number;
	title: string;
	lang: string;
	wrapperProps?: never;
	icon?: never;
	component?: never;
};
export type CodeProcessedEager = CodeProcessedBase & { rawHTML: string };
export type CodeProcessedLazy = CodeProcessedBase & { rawHTML: Promise<string> };

type ComponentProcessedBase = {
	index: number;
	title: string;
	lang?: never;
	wrapperProps?: WrapperProps;
	icon?: 'svelte';
	rawHTML?: never;
};
export type ComponentProcessedLazy = ComponentProcessedBase & { component: Promise<DemoComponent> };
export type ComponentProcessedEager = ComponentProcessedBase & { component: DemoComponent };

export type MergedProcessed = {
	main?: (CodeProcessedEager | ComponentProcessedEager)[];
	lazy?: Record<string, (CodeProcessedLazy | ComponentProcessedLazy)[]>;
};

export type DemoName = string;
