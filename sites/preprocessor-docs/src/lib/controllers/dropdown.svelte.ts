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

// arrow functions break $state class fields with unhelpful message

// I want to use close = () => {} instead of close() {} so that I can pass the method around directly like `use:clickoutside={{ onOutclick: dropdownController.close }}` without worrying about
// TypeError: Cannot read private member #dropdownShown from an object whose class did not declare it

// But when I use arrow syntax:
// [plugin:vite-plugin-svelte-module] src/lib/controllers/dropdown.svelte.ts:5:26 `$state(...)` can only be used as a variable declaration initializer or a class field
// even though the variable IS a class field like this:
// #dropdownShown = $state(false);

// Oddly enough, this works if I make a standalone project with the same dependencies. It doesn't work in the monorepo

// export class DropdownController {
// 	#dropdownShown = $state(false);
// 	#firstElSelector: string | null = null;

// 	constructor(firstElSelector?: string) {
// 		this.#firstElSelector = firstElSelector ?? null;
// 	}

// 	#focus() {
// 		tick().then(() => {
// 			if (this.#firstElSelector) {
// 				const el = document.querySelector(this.#firstElSelector);
// 				if (el instanceof HTMLElement) el.focus();
// 			}
// 		});
// 	}

// 	open = (e: Event, focus?: 'focus') => {
// 		e.preventDefault();
// 		this.#dropdownShown = true;
// 		if (focus) this.#focus();
// 	};

// 	close = (e: Event) => {
// 		e.preventDefault();
// 		this.#dropdownShown = false;
// 	};

// 	toggle = (e: Event, focus: 'focus' | undefined = 'focus') => {
// 		if (this.#dropdownShown) this.close(e);
// 		else this.open(e, focus);
// 	};

// 	get isOpen() {
// 		return this.#dropdownShown;
// 	}
// }
