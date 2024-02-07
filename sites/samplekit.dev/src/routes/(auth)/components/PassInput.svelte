<script lang="ts">
	import { Eye, EyeOff } from 'lucide-svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';

	export let name_id: 'password' | 'confirmation' | 'currentPassword';
	export let autocomplete: 'new-password' | 'current-password';
	export let disabled: boolean;
	export let attrs: HTMLInputAttributes | undefined;
	export let onChange: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
	export let value: string;
	export let invalid: boolean;

	export let placeholder = '············';
	export let required = true;
	let classes = 'input-text input-text-has-btn';
	export { classes as class };

	let passElType = 'password';
	const togglePassVis = () => {
		passElType = passElType === 'password' ? 'text' : 'password';
	};
</script>

<!--
  @component
  Defaults:
	- placeholder: '············'
	- required: true
	- class: 'input-text input-text-has-btn'
-->
<div class="peer relative">
	<input
		{value}
		on:change={(e) => onChange(e)}
		name={name_id}
		type={passElType}
		id={name_id}
		class={classes}
		class:input-invalid={invalid}
		{placeholder}
		{autocomplete}
		{disabled}
		{required}
		{...attrs}
	/>
	<div class="input-text-btn-wrapper">
		<button type="button" class="input-text-btn" on:click={togglePassVis}>
			{#if passElType === 'password'}<EyeOff class="h-5 w-5" />{:else}<Eye class="h-5 w-5" />{/if}
		</button>
	</div>
</div>
