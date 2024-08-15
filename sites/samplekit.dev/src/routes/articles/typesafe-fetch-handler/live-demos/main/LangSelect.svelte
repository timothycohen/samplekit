<script lang="ts">
	import { createSelect } from '@melt-ui/svelte';
	import { Select } from '$lib/components';
	import { type Lang, langOptions, isSupportedLang } from './lang.service.common';

	interface Props {
		onSelect: (lang: Lang) => void;
	}

	const { onSelect }: Props = $props();

	const select = createSelect<{ lang: Lang }>({
		defaultSelected: langOptions.language[0],
		onSelectedChange: ({ next }) => {
			if (isSupportedLang(next?.value.lang)) {
				onSelect(next.value.lang);
				return next;
			}
			next = langOptions.language[0];
			return langOptions.language[0];
		},
	});
</script>

<div class="backdrop-blur-sm">
	<Select options={langOptions} title="Language: " ariaLabel="language" {select} />
</div>
