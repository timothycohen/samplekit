<script lang="ts">
	import { mfaLabels } from '$lib/db/client';
	import { Verifier } from '$routes/(auth)/components';

	export let data;
</script>

<section class="h-screen-nav mx-auto w-full max-w-3xl space-y-8 px-2">
	<h1 class="text-h4"><span class="capitalize">{data.action}</span> {mfaLabels[data.desiredMFA]} MFA</h1>

	<Verifier veri={data.veri} />

	<slot />

	<div class="h-px"></div>
</section>
