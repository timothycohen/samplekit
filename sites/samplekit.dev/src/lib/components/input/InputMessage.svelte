<script lang="ts">
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	import { httpCodeMap } from '$lib/http/common';
	import type { Writable } from 'svelte/store';

	export let form: { success?: undefined; fail: string } | { fail?: undefined; success: string } | null = null;
	export let message: Writable<App.Superforms.Message | undefined> | undefined = undefined;
	export let failOnly = false;
	export let useParams = false;

	$: fSuccess = typeof form?.success === 'string' && form.success.length ? form.success : null;
	$: mSuccess = typeof $message?.success === 'string' && $message.success.length ? $message.success : null;
	$: fFail = typeof form?.fail === 'string' && form.fail.length ? form.fail : null;
	$: mFail = typeof $message?.fail === 'string' && $message.fail.length ? $message.fail : null;
	$: success = fSuccess ?? mSuccess ?? '';
	$: fail = fFail ?? mFail ?? '';
</script>

<div class="input-subtext">
	{#if useParams}
		{#if !failOnly && $page.url.searchParams.get('success')}
			<span class="text-success-9">{$page.url.searchParams.get('success')}</span>
		{:else if $page.url.searchParams.get('fail')}
			<span class="text-error-9">{$page.url.searchParams.get('fail')}</span>
		{/if}
	{:else}
		{#if !failOnly && success}
			<span class="text-success-9">{success}</span>
		{:else if fail}
			<span class="text-error-9">{fail}</span>
		{/if}

		<noscript>
			{#if $page.status > 200 && $page.status < 400 && !failOnly}
				<span class="text-success-9">{httpCodeMap[$page.status] ?? 'Success'}</span>
			{:else if $page.status >= 400}
				<span class="text-error-9">{httpCodeMap[$page.status] ?? 'Error'}</span>
			{/if}
		</noscript>
	{/if}
</div>
