<script lang="ts">
	import I from '$lib/icons';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		name_id: 'password' | 'confirmation' | 'currentPassword';
		autocomplete: 'new-password' | 'current-password';
		disabled: boolean;
		attrs: HTMLInputAttributes | undefined;
		onChange: (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => void;
		value: string;
		invalid: boolean;
		placeholder?: string;
		required?: boolean;
		class?: string;
	}

	const {
		name_id,
		autocomplete,
		disabled,
		attrs,
		onChange,
		value,
		invalid,
		placeholder = '············',
		required = true,
		class: classes = 'input-text input-text-has-btn',
	}: Props = $props();

	let passElType = $state('password');
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
		onchange={(e) => onChange(e)}
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
		<button type="button" class="input-text-btn" onclick={togglePassVis}>
			{#if passElType === 'password'}<I.EyeOff class="h-5 w-5" />{:else}<I.Eye class="h-5 w-5" />{/if}
		</button>
	</div>
</div>
