<script lang="ts">
	import { createPinInput, melt } from '@melt-ui/svelte';

	export let onChange: ((a: { filled: true; code: string } | { filled: false; code?: never }) => void) | undefined =
		undefined;

	export let namePrefix: string;

	const codeLength = 6;

	let rootEl: HTMLElement;

	const overrideUpAndDownArrow = (
		e: KeyboardEvent & { currentTarget: EventTarget & HTMLInputElement },
		index: number,
	) => {
		if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
			e.preventDefault();

			const offset = e.key === 'ArrowUp' ? 1 : -1;
			const bounds: [string, string] = e.key === 'ArrowUp' ? ['9', '0'] : ['0', '9'];

			let newStr = '';
			if (['', bounds[0]].includes(e.currentTarget.value)) newStr = bounds[1];
			else {
				const num = parseInt(e.currentTarget.value, 10);
				if (!isNaN(num)) newStr = (num + offset).toString();
			}
			if (newStr) {
				e.currentTarget.value = newStr;
				value.update((v) => {
					v[index] = newStr;
					return v;
				});
			}
		}
	};

	// melt-ui lets all alphanumeric keys through. It's easier to do this here than in the keydown function
	const replaceCorruptValues = ({ next }: { next: string[] }): string[] => {
		let lastCorruptedIndex: number | null = null;
		for (let i = 0; i < next.length; i++) {
			const c = next[i]!;
			if (c === '') continue;
			const num = parseInt(c, 10);
			if (isNaN(num)) {
				next[i] = '';
				lastCorruptedIndex = i;
			}
		}

		if (lastCorruptedIndex !== null) {
			const input = rootEl.querySelector(`input:nth-child(${lastCorruptedIndex + 1})`) as HTMLInputElement | null;
			if (input) input.focus();
		}

		return next;
	};

	const {
		elements: { root, input },
		states: { value, valueStr },
	} = createPinInput({ onValueChange: replaceCorruptValues });

	$: {
		if (onChange) {
			if ($value.every((v) => v !== '')) onChange({ filled: true, code: $valueStr });
			else onChange({ filled: false });
		}
	}
</script>

<div use:melt={$root} class="flex items-center gap-1" bind:this={rootEl}>
	{#each Array.from({ length: codeLength }) as _, i}
		<input
			class="h-16 w-9 rounded-badge border border-gray-7 text-center placeholder-gray-8 {i === 2 ? 'mr-10' : ''}"
			on:keydown={(e) => overrideUpAndDownArrow(e, i)}
			use:melt={$input()}
			inputmode="numeric"
			pattern="[0-9]"
			name="{namePrefix}-{i}"
			autocomplete="off"
		/>
	{/each}
</div>
