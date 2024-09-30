import { splitAndProcess } from './common';
import type { NoPropComponent } from '$lib/utils/common';
import type { ComponentProcessedLazy, ModuleDefinitions } from './types';

export const processComponents = (moduleDefinitions: ModuleDefinitions) => {
	return moduleDefinitions.reduce<Array<ComponentProcessedLazy>>((acc, curr, index) => {
		if (!curr.loadComponent) return acc;

		const { title, loadComponent, wrapperProps, icon } = curr;
		return [
			...acc,
			{
				title,
				index,
				component: (loadComponent() as Promise<{ default: NoPropComponent }>).then((c) => c.default),
				wrapperProps,
				icon,
			},
		];
	}, []);
};

export const processedComponentsMap = splitAndProcess(processComponents);
