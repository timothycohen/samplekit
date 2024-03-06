<script lang="ts">
	import { createSelect } from '@melt-ui/svelte';
	import { Select } from '$lib/components';
	import { isValidLang, type Lang } from '.';

	const langOptions: { language: Array<{ value: { lang: Lang }; label: string }> } = {
		language: [
			{ value: { lang: 'EN' }, label: 'English' },
			{ value: { lang: 'DE' }, label: 'Deutsch' },
			{ value: { lang: 'KO' }, label: '한국어' },
		],
	};
	const defaultSelected = langOptions.language![0]!;
	export let selectedLang = defaultSelected.value.lang;

	const select = createSelect<{ lang: Lang }>({
		defaultSelected,
		onSelectedChange: ({ next }) => {
			if (isValidLang(next?.value.lang)) {
				selectedLang = next.value.lang;
				return next;
			}
			next = defaultSelected;
			return defaultSelected;
		},
	});
</script>

<div class="backdrop-blur-sm">
	<Select options={langOptions} title="Language: " ariaLabel="language" {select} />
</div>
