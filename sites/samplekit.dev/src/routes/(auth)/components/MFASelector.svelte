<script lang="ts">
	import { mfaLabels } from '$lib/auth/client';

	export let mfasEnabled: DB.MFAs.Enabled;
	export let selectedMFAMethod: DB.MFAs.Kind | '';
	export let onChange: (kind: DB.MFAs.Kind) => void;

	const handleChange = (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
		onChange(e.currentTarget.value as DB.MFAs.Kind);
	};
</script>

<div>
	<div class="flex justify-between text-sm font-bold">
		<label for="mfa_method" class="mb-2 font-bold">Authentication Method</label>
		<slot name="right-of-header" />
	</div>

	<select value={selectedMFAMethod} id="mfa_method" class="input-text" on:change={handleChange}>
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
		<div class="alert-wrapper alert-wrapper-warning mt-6">Please enable JavaScript to continue.</div>
	</noscript>
</div>
