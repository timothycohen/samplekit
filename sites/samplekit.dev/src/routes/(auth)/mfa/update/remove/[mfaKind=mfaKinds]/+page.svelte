<script lang="ts">
	import { mfaLabels } from '$lib/auth/common';
	import { actionsMap } from '$routes/(auth)/actionsMap';

	const { data } = $props();
</script>

<div class="space-y-8 rounded-card p-8 shadow-3">
	<h2 class="t-base-lg font-medium">Step 2: Confirm {mfaLabels[data.desiredMFA]} MFA Deletion</h2>
	<form action={actionsMap.removeMFAWithSeshConf(data.desiredMFA)} method="post">
		<button class="btn btn-error" disabled={!data.veri.verified}>Confirm</button>
	</form>
</div>
