<script lang="ts">
	import { mfaLabels } from '$lib/auth/common';
	import { Admonition } from '$lib/components';
	import type { Snippet } from 'svelte';

	interface Props {
		mfasEnabled: DB.MFAs.Enabled;
		selectedMFAMethod: DB.MFAs.Kind | '';
		onChange: (kind: DB.MFAs.Kind) => void;
		children: Snippet;
	}

	const { mfasEnabled, selectedMFAMethod, onChange, children }: Props = $props();

	const handleChange = (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
		onChange(e.currentTarget.value as DB.MFAs.Kind);
	};
</script>

<div>
	<div class="flex justify-between text-sm font-bold">
		<label for="mfa_method" class="mb-2 font-bold">Authentication Method</label>
		{@render children()}
	</div>

	<select value={selectedMFAMethod} id="mfa_method" class="input-text" onchange={handleChange}>
		<option value="" disabled selected>Select a method</option>
		{#if mfasEnabled.sms}
			<option value="sms">{mfaLabels['sms']}</option>{/if}
		{#if mfasEnabled.authenticator}
			<option value="authenticator"> {mfaLabels['authenticator']}</option>
		{/if}
		{#if mfasEnabled.passkeys}
			<option value="passkeys">{mfaLabels['passkeys']}</option>{/if}
	</select>

	<noscript>
		<Admonition bold kind="security" title="JS Required">Enable JavaScript to continue.</Admonition>
	</noscript>
</div>
