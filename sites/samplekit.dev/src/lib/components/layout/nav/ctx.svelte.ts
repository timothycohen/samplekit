import { defineCtx } from '$lib/svelte-context';
import { MobileNavController } from './mobileNavController.svelte';

const [getCtx, setCtx] = defineCtx<{ mobileNav: MobileNavController; position: 'left' | 'center' }>();

const createMobileNavCtx = () => {
	let position: 'left' | 'center' = $state('left');

	setCtx({
		mobileNav: new MobileNavController({
			transitionWidth: 768,
			animationDuration: 0,
			trapFocus: { selectorsBefore: ['#mobile-nav-btn'], selectorsAfter: ['#theme-switch-btn'] },
			getMobileNavEl: () => (document.querySelector('#nav--mobile') as HTMLElement) || null,
		}),
		get position() {
			return position;
		},
		set position(val) {
			position = val;
		},
	});
};

const useMobileNavCtx = getCtx;

export { createMobileNavCtx, useMobileNavCtx };
