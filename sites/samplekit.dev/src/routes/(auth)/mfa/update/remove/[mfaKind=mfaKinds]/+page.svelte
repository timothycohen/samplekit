<script lang="ts">
	import { mfaLabels } from '$lib/db/client';

	export let data;
</script>

<div class="rounded-card shadow-3 space-y-8 p-8">
	<h2 class="t-base-lg font-medium">Step 2: Confirm {mfaLabels[data.desiredMFA]} MFA Deletion</h2>
	<form action="/mfa/update/remove/{data.desiredMFA}?/removeMFAWithSeshConf" method="post">
		<button class="btn btn-error" disabled={!data.veri.verified}>Confirm</button>
	</form>
</div>
