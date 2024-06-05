<script lang="ts">
	export let multiple = false;
	export let accept: string | null = 'image/*';
	export let disabled = false;
	export let onSelect: (files: File[]) => void;

	let inputEl: HTMLInputElement;
	let isDragover = false;

	const dispatchFiles = (fileList: FileList | null) => {
		if (!fileList) return;

		const files: File[] = [];
		for (const file of fileList) {
			files.push(file);
		}

		if (files.length) onSelect(files);
	};
</script>

<div
	class="min-w-64 rounded-card p-2 transition {disabled
		? 'animate-pulse bg-gray-3/25'
		: isDragover
			? 'bg-gray-7'
			: 'bg-gray-2'}"
>
	<input
		type="file"
		id="file"
		{multiple}
		{accept}
		on:input={() => {
			dispatchFiles(inputEl.files);
			inputEl.value = '';
		}}
		{disabled}
		bind:this={inputEl}
		class="peer sr-only"
	/>

	<label
		on:dragenter={() => {
			isDragover = true;
		}}
		on:dragover|preventDefault={() => {
			isDragover = true;
		}}
		on:dragleave={() => {
			isDragover = false;
		}}
		on:dragend={() => {
			isDragover = false;
		}}
		on:drop|preventDefault={(e) => {
			const dataTransfer = e.dataTransfer;
			if (!dataTransfer) return;
			isDragover = false;
			dispatchFiles(dataTransfer.files);
		}}
		for="file"
		class="block rounded-card border-2 border-dashed border-gray-10 p-4 text-center font-semibold text-gray-11 transition-colors peer-focus-visible:border-accent-7
		{disabled ? '' : 'cursor-pointer'}"
	>
		{#if disabled}
			<span>Preparing files...</span>
		{:else if multiple}
			<span>Choose files</span> or drag them here
		{:else}
			<span>Choose a file</span> or drag it here
		{/if}
	</label>
</div>
