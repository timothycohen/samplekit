export type MinMaxValOpts = { min?: number; max?: number; waitUntilBlur?: true; onUpdate?: (value: string) => unknown };

export const minMaxVal = (node: HTMLInputElement, { min, max, waitUntilBlur, onUpdate }: MinMaxValOpts) => {
	const onValueChange = () => {
		if (node.value === '') return onUpdate?.(node.value);

		const numVal = parseFloat(node.value);

		if (min !== undefined && numVal !== null && numVal < min) {
			node.value = min.toString();
		} else if (max !== undefined && numVal !== null && numVal > max) {
			node.value = max.toString();
		}

		if (node.value.startsWith('0') && node.value.length > 1) {
			if (node.value === '00') {
				node.value = '0';
			} else {
				node.value = node.value.replace(/^0+/, '');
			}
		}

		onUpdate?.(node.value);
	};

	node.addEventListener(waitUntilBlur ? 'blur' : 'input', onValueChange);
	return {
		destroy() {
			node.removeEventListener(waitUntilBlur ? 'blur' : 'input', onValueChange);
		},
	};
};

/**
 *
 * onUpdate fires after the value has been validated (enter, blur, arrow up/down)
 *
 * onMaybeDirty fires on changes not handled by onUpdate (e.g. typing / backspace)
 */
export const maskPositiveInt = (
	node: HTMLInputElement,
	{
		onUpdate,
		onMaybeDirty,
	}: {
		onMaybeDirty?: (a: {
			num: number | null;
			str: string;
			e: InputEvent & { currentTarget: EventTarget & HTMLInputElement };
		}) => void;
		onUpdate?: (a: {
			cleanNum: number | null;
			cleanStr: string;
			e: InputEvent & { currentTarget: EventTarget & HTMLInputElement };
		}) => void;
	} = {},
) => {
	let minVal = node.min ? parseInt(node.min, 10) : 0;
	if (typeof minVal !== 'number' || Number.isNaN(minVal) || minVal < 0) minVal = 0;
	node.min = minVal.toString();

	let maxVal = node.max ? parseInt(node.max, 10) : Infinity;
	if (typeof maxVal !== 'number' || Number.isNaN(maxVal) || maxVal < minVal) maxVal = Infinity;
	node.max = maxVal === Infinity ? '' : maxVal.toString();

	if (node.min.length && node.max.length) node.maxLength = Math.max(node.min.length, node.max.length);

	const handleArrows = (increment: 1 | -1) => {
		const numVal = node.value === '' ? 0 : parseInt(node.value);
		if (isNaN(numVal)) return;
		const newVal = Math.min(Math.max(numVal + increment, minVal), maxVal);
		const clamped = Math.min(Math.max(newVal, minVal), maxVal);
		node.value = clamped.toString();
		node.dispatchEvent(new Event('change'));
	};

	const beforeChangeListener = (e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
		if (['ArrowRight', 'ArrowLeft', 'Delete', 'Backspace', 'Enter'].includes(e.key)) return;
		if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();
			return handleArrows(e.key === 'ArrowUp' ? 1 : -1);
		}
		if (!e.key.match(/[0-9]/)) return e.preventDefault();
		if (e.currentTarget.maxLength === e.currentTarget.value.length) return e.preventDefault();
		if (e.currentTarget.value === '0' && e.key === '0') return e.preventDefault();

		if (e.currentTarget.value === '0') {
			e.currentTarget.value = '';
		}
	};

	const handleAria = (e: InputEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
		if (e.currentTarget.value === '') {
			if (e.currentTarget.required) e.currentTarget.ariaInvalid = 'true';
		} else {
			const numVal = parseInt(e.currentTarget.value, 10);
			e.currentTarget.ariaInvalid = (Number.isNaN(numVal) || numVal > maxVal || numVal < minVal).toString();
		}
	};

	const afterChangeListener = (e: InputEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
		handleAria(e);

		if (onMaybeDirty) {
			const num = parseInt(e.currentTarget.value, 10);
			if (Number.isNaN(num)) onMaybeDirty({ num: null, str: e.currentTarget.value, e });
			else onMaybeDirty({ num, str: e.currentTarget.value, e });
		}
	};

	const enterOrBlurListener = (e: InputEvent & { currentTarget: EventTarget & HTMLInputElement }) => {
		e.currentTarget.dataset['touched'] = '';
		const numVal = parseInt(e.currentTarget.value, 10);
		const cleanNum = Number.isNaN(numVal) ? null : Math.min(Math.max(numVal, minVal), maxVal);
		const cleanStr = cleanNum === null ? '' : cleanNum.toString();
		e.currentTarget.value = cleanStr;
		onUpdate?.({ cleanNum, cleanStr, e });
		handleAria(e);
	};

	const listeners = [
		['keydown', beforeChangeListener],
		['input', afterChangeListener],
		['change', enterOrBlurListener],
	];

	// @ts-expect-error – node is an input
	listeners.forEach(([event, listener]) => node.addEventListener(event, listener));

	return {
		destroy() {
			// @ts-expect-error – node is an input
			listeners.forEach(([event, listener]) => node.removeEventListener(event, listener));
		},
	};
};
