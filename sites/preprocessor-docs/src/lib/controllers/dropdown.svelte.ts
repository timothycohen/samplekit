import { tick } from 'svelte';

export const dropdownController = (firstElSelector: string | null = null) => {
	let dropdownShown = $state(false);

	const focusFirst = () => {
		tick().then(() => {
			if (firstElSelector) {
				const el = document.querySelector(firstElSelector);
				if (el instanceof HTMLElement) el.focus();
			}
		});
	};

	const open = (e: Event, focus?: 'focus') => {
		e.preventDefault();
		dropdownShown = true;
		if (focus) focusFirst();
	};

	const close = (e: Event) => {
		e.preventDefault();
		dropdownShown = false;
	};

	const toggle = (e: Event, focus: 'focus' | undefined = 'focus') => {
		if (dropdownShown) close(e);
		else open(e, focus);
	};

	return {
		open,
		close,
		toggle,
		get isOpen() {
			return dropdownShown;
		},
	};
};
