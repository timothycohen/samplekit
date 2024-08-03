<script lang="ts">
	/*
	 * bug-svelte-5

	 * Was using Melt-UI but it was buggy: https://github.com/melt-ui/melt-ui/issues/1245
	 *
	 * This seems simpler
	 */

	interface Props {
		onChange?: ((a: { filled: true; code: string } | { filled: false; code?: never }) => void) | undefined;
		namePrefix: string;
		codeLength?: number;
	}

	const { namePrefix, onChange, codeLength = 6 }: Props = $props();

	const value = $state(Array.from({ length: codeLength }).map(() => ''));
	const filled = $derived(value.every((v) => v !== ''));

	$effect(() => {
		if (onChange) {
			if (filled) onChange({ filled: true, code: value.join('') });
			else onChange({ filled: false });
		}
	});

	type Valid = '' | '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
	const isValid = (data: unknown): data is Valid => {
		if (typeof data !== 'string') return false;
		return ['', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(data);
	};

	type KeyEvent = KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement };
	type PasteEvent = ClipboardEvent & { currentTarget: EventTarget & HTMLInputElement };

	const enterValid = (e: KeyEvent, index: number) => {
		value[index] = e.key;
		focusNext(e.currentTarget);
	};

	const focusPrev = (currentTarget: KeyEvent['currentTarget']) => {
		const input = currentTarget.previousElementSibling as HTMLInputElement | null;
		if (input) input.focus();
		return input;
	};

	const focusNext = (currentTarget: KeyEvent['currentTarget']) => {
		const input = currentTarget.nextElementSibling as HTMLInputElement | null;
		if (input) input.focus();
		return input;
	};

	const focusNextN = (currentTarget: KeyEvent['currentTarget'], n: number) => {
		let input = currentTarget;
		if (!input) return;
		let next = input.nextElementSibling;
		let i = 0;
		while (i < n && next) {
			input = next as HTMLInputElement;
			next = input.nextElementSibling;
			i++;
		}
		if (input) input.focus();
		return input;
	};

	const deleteBackward = (currentTarget: KeyEvent['currentTarget'], i: number) => {
		const input = currentTarget.value;
		if (!input.length) focusPrev(currentTarget);
		else value[i] = input.substring(0, input.length - 1);
	};

	const deleteForward = (currentTarget: KeyEvent['currentTarget'], i: number) => {
		const input = currentTarget.value;
		if (!input.length) focusNext(currentTarget);
		else value[i] = input.substring(1);
	};

	const increment = (currentTarget: KeyEvent['currentTarget'], i: number) => {
		const val = currentTarget.value;
		if (val === '9' || val === '') value[i] = '0';
		else value[i] = (parseInt(val, 10) + 1).toString();
	};

	const decrement = (currentTarget: KeyEvent['currentTarget'], i: number) => {
		const val = currentTarget.value;
		if (val === '0' || val === '') value[i] = '9';
		else value[i] = (parseInt(val, 10) - 1).toString();
	};

	const onpaste = (e: PasteEvent, i: number) => {
		const data = e.clipboardData?.getData('text') ?? '';
		e.preventDefault();
		let j = i;
		for (; j < i + data.length && j <= codeLength; j++) {
			const val = data[j - i];
			if (isValid(val)) value[j] = val;
			else break;
		}
		focusNextN(e.currentTarget, j - i);
	};
</script>

<div class="flex items-center gap-1">
	{#each Array.from({ length: codeLength }) as _, i}
		<input
			class="h-16 w-9 rounded-badge border border-gray-7 text-center placeholder-gray-5 focus:placeholder:text-transparent
			{i === 2 ? 'mr-10' : ''}"
			type="text"
			inputmode="numeric"
			placeholder="○"
			pattern="[0-9]"
			autocomplete="off"
			name="{namePrefix}-{i}"
			value={value[i]}
			onkeydown={(e) => {
				if (e.metaKey || e.ctrlKey || ['Tab', 'Shift', 'Enter'].includes(e.key)) return;
				e.preventDefault();
				if (e.key === 'ArrowLeft') focusPrev(e.currentTarget);
				else if (e.key === 'ArrowRight') focusNext(e.currentTarget);
				else if (e.key === 'Backspace') deleteBackward(e.currentTarget, i);
				else if (e.key === 'Delete') deleteForward(e.currentTarget, i);
				else if (e.key === 'ArrowUp') increment(e.currentTarget, i);
				else if (e.key === 'ArrowDown') decrement(e.currentTarget, i);
				else if (isValid(e.key)) enterValid(e, i);
			}}
			onpaste={(e) => onpaste(e, i)}
		/>
	{/each}
</div>
