<script lang="ts">
	import { mfaLabels } from '$lib/auth/common';
	import { Verifier } from '$routes/(auth)/components';

	const { data, children } = $props();
</script>

<section class="mx-auto h-screen-nav w-full max-w-3xl space-y-8 px-2">
	<h1 class="mt-8 text-h4"><span class="capitalize">{data.action}</span> {mfaLabels[data.desiredMFA]} MFA</h1>

	<Verifier veri={data.veri} />

	{@render children()}

	<div class="h-px"></div>
</section>
