export function advanceInput(el: HTMLInputElement, opts: { setter: (val: string) => unknown; allowed?: RegExp }) {
	const move = (next: 'previous' | 'next') => {
		let neighbor = el[`${next}ElementSibling`] as HTMLInputElement;
		if (neighbor && neighbor.dataset['skipAdvance']) neighbor = neighbor[`${next}ElementSibling`] as HTMLInputElement;
		if (neighbor) neighbor.focus();
	};

	const arrowListener = (e: KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			move('previous');
		}
		if (e.key === 'ArrowRight') {
			e.preventDefault();
			move('next');
		}
	};

	const inputListener = (e: InputEvent) => {
		if (e.inputType === 'insertLineBreak') return;
		e.preventDefault();

		if (e.inputType === 'deleteContentBackward' || e.inputType === 'deleteContentForward') {
			if (el.value !== '') opts.setter('');
			else move(e.inputType === 'deleteContentBackward' ? 'previous' : 'next');
			return;
		}

		if (e.data && (opts?.allowed || /^[a-zA-Z0-9]$/).test(e.data)) {
			opts.setter(e.data);
			move('next');
		}
	};

	el.addEventListener('beforeinput', inputListener);
	el.addEventListener('keydown', arrowListener);

	return {
		destroy() {
			el.removeEventListener('beforeinput', inputListener);
			el.removeEventListener('keydown', arrowListener);
		},
	};
}
