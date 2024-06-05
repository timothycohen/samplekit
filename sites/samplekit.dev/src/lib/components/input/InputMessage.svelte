<script lang="ts">
	import { page } from '$app/stores';
	page; // https://github.com/sveltejs/eslint-plugin-svelte/issues/652#issuecomment-2087008855
	import { httpCodeMap } from '$lib/http/common';
	import type { Writable } from 'svelte/store';

	interface Props {
		form?: { success?: undefined; fail: string } | { fail?: undefined; success: string } | null,
		message?: Writable<App.Superforms.Message | undefined> | undefined,
		failOnly?: boolean,
		useParams?: boolean
	}

	let {
		form = null,
		message = undefined,
		failOnly = false,
		useParams = false
	}: Props = $props();

	let fSuccess = $derived(typeof form?.success === 'string' && form.success.length ? form.success : null);
	let mSuccess = $derived(typeof $message?.success === 'string' && $message.success.length ? $message.success : null);
	let fFail = $derived(typeof form?.fail === 'string' && form.fail.length ? form.fail : null);
	let mFail = $derived(typeof $message?.fail === 'string' && $message.fail.length ? $message.fail : null);
	let success = $derived(fSuccess ?? mSuccess ?? '');
	let fail = $derived(fFail ?? mFail ?? '');
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
