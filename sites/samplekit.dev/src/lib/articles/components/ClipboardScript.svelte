<script lang="ts">
	import { onMount } from 'svelte';

	function copyToClipboardListener(event: Event) {
		const btnEl = event.currentTarget as HTMLButtonElement;
		const rehypeCodeTitle = btnEl.parentElement;
		const rehypePrettyCodeFragment = rehypeCodeTitle?.nextElementSibling;
		if (!rehypePrettyCodeFragment?.textContent) return;
		navigator.clipboard.writeText(rehypePrettyCodeFragment.textContent);

		btnEl.innerHTML = copySuccessInnerHTML;

		setTimeout(() => {
			btnEl.innerHTML = originalInnerHTML;
		}, 1000);
	}

	// https://lucide.dev/icons/clipboard
	let originalInnerHTML = '';
	const copySuccessInnerHTML = `
<span class="sr-only">Copied</span>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-check"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>`;

	onMount(() => {
		const copyBtnEls = document.querySelectorAll('.copy');

		copyBtnEls.forEach((btn) => {
			if (!originalInnerHTML) originalInnerHTML = btn.innerHTML;
			btn.addEventListener('click', copyToClipboardListener);
		});

		return () => {
			originalInnerHTML = '';
			copyBtnEls.forEach((btn) => btn.removeEventListener('click', copyToClipboardListener));
		};
	});
</script>
