import type { WrapperProps } from '$lib/components/PatternWrapper.svelte';
import type { NoPropComponent } from '$lib/utils/common';
import type { MdLang } from '@samplekit/preprocess-shiki';

export type CodeDefined = {
	title: string;

	loadRaw: () => Promise<unknown>;
	lang?: MdLang;

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

export type CodeProcessed = {
	title: string;
	index: number;

	rawHTML: string | Promise<string>;
	lang: MdLang;

	wrapperProps?: never;
	icon?: never;
	component?: never;
};

export type ComponentProcessed = {
	title: string;
	index: number;

	rawHTML?: never;
	lang?: never;

	component: NoPropComponent | Promise<NoPropComponent>;
	icon?: 'svelte';
	wrapperProps?: WrapperProps;
};

export type MergedProcessed = {
	main?: (CodeProcessed | ComponentProcessed)[];
	lazy?: Record<string, (CodeProcessed | ComponentProcessed)[]>;
};

export type DemoName = string;
