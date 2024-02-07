type Callback = (e: KeyboardEvent) => void;
export type KeyFnMap = Record<KeyboardEvent['code'], Callback[]>;

export const keyboard = (listenerNode: HTMLElement, keyCallbackMap: KeyFnMap) => {
	const onKeydown = (e: KeyboardEvent) => {
		for (const keyCode of Object.keys(keyCallbackMap)) {
			if (e.code === keyCode) {
				keyCallbackMap[keyCode]?.forEach((cb) => cb(e));
			}
		}
	};

	listenerNode.addEventListener('keydown', onKeydown);

	return {
		destroy() {
			listenerNode.removeEventListener('keydown', onKeydown);
		},
	};
};

export const clickOn = (listenerNode: HTMLElement, keyCodes: KeyboardEvent['code'][]) => {
	function cb(e: KeyboardEvent) {
		e.currentTarget instanceof HTMLElement && e.currentTarget.click();
	}

	const { destroy } = keyboard(
		listenerNode,
		keyCodes.reduce((acc, keyCode) => {
			acc[keyCode] = [cb];
			return acc;
		}, {} as KeyFnMap),
	);

	return {
		destroy,
	};
};
