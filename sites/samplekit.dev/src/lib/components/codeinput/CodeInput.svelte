<script lang="ts">
	import { advanceInput } from './advanceInput';

	export let disabled = false;
	export let namePrefix: string;
	export let type: 'number' | 'text' = 'number';
	export let onChange: ((a: { filled: true; code: string } | { filled: false; code?: never }) => void) | undefined =
		undefined;

	const codeLength = 6;
	const allowed = type === 'text' ? /^[a-zA-Z0-9]$/ : /^[0-9]$/;
	let code: Array<string | null> = Array(codeLength).fill('');

	$: {
		if (code.every((v) => v !== '')) onChange?.({ filled: true, code: code.join('') });
		else onChange?.({ filled: false });
	}
</script>

<div class="grid h-16 w-72 grid-cols-7 gap-1">
	{#each [code[0], code[1], code[2], null, code[3], code[4], code[5]] as v, index}
		{@const i = index > 2 ? index - 1 : index}
		{#if v === null}
			<span data-skip-advance="true" />
		{:else}
			<input
				{disabled}
				placeholder="○"
				{type}
				name="{namePrefix}-{i}"
				min="0"
				max="9"
				maxlength="1"
				autocomplete="off"
				class="border-gray-7 placeholder-gray-8 ring-accent-7 rounded-badge border text-center focus:placeholder-transparent"
				value={v}
				use:advanceInput={{ setter: (v) => (code[i] = v), allowed }}
				on:paste|preventDefault={(e) => {
					const pasted = e.clipboardData?.getData('text');
					if (!pasted) return;

					if (pasted.length === codeLength) {
						code = pasted.split('');
						return;
					}

					for (let charIndex = 0; charIndex < pasted.length; charIndex++) {
						const char = pasted[charIndex];
						const codeIndex = i + charIndex;
						if (!char || codeIndex >= codeLength) break;
						if (allowed.test(char)) {
							code[codeIndex] = char;
						}
					}
				}}
			/>
		{/if}
	{/each}
</div>

<style>
	input[type='number']::-webkit-inner-spin-button {
		display: none;
	}

	input[type='number'] {
		appearance: textfield;
		-moz-appearance: textfield;
		-webkit-appearance: textfield;
	}
</style>
