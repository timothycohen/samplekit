export const windowEscape = (_node: HTMLElement, cb?: (e: KeyboardEvent) => void) => {
	if (!cb) return;

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape') cb?.(event);
	};

	document.addEventListener('keydown', handleKeydown, true);

	return {
		destroy() {
			document.removeEventListener('keydown', handleKeydown, true);
		},
	};
};
