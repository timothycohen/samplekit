import { splitAndProcess } from './common';
import type { ComponentProcessedLazy, DemoComponent, ModuleDefinitions } from './types';

export const processComponents = (moduleDefinitions: ModuleDefinitions) => {
	return moduleDefinitions.reduce<Array<ComponentProcessedLazy>>((acc, curr, index) => {
		if (!curr.loadComponent) return acc;

		const { title, loadComponent, wrapperProps, icon } = curr;
		return [
			...acc,
			{
				title,
				index,
				component: (loadComponent() as Promise<{ default: DemoComponent }>).then((c) => c.default),
				wrapperProps,
				icon,
			},
		];
	}, []);
};

export const processedComponentsMap = splitAndProcess(processComponents);
