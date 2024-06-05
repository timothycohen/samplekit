<script lang="ts"> = $state()
	interface Props {
		multiple?: boolean,
		accept?: string | null,
		disabled?: boolean,
		onSelect: (files: File[]) => void
	}

	let {
		multiple = false,
		accept = 'image/*',
		disabled = false,
		onSelect
	}: Props = $props();

	let inputEl: HTMLInputElement;
	let isDragover = $state(false);

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
		oninput={() => {
			dispatchFiles(inputEl.files);
			inputEl.value = '';
		}}
		{disabled}
		bind:this={inputEl}
		class="peer sr-only"
	/>

	<label
		ondragenter={() => {
			isDragover = true;
		}}
		ondragover={(event) => {
	event.preventDefault();
	
			isDragover = true;
		
}}
		ondragleave={() => {
			isDragover = false;
		}}
		ondragend={() => {
			isDragover = false;
		}}
		ondrop={(e) => {
	e.preventDefault();
	
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
