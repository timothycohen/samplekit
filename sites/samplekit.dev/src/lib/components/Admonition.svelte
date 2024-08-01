<script lang="ts">
	import { default as Icon, type AdmonitionIconName } from './AdmonitionIcon.svelte';
	import type { Snippet } from 'svelte';

	type AdmonitionType =
		| 'note'
		| 'info'
		| 'tip'
		| 'hint'
		| 'important'
		| 'warning'
		| 'caution'
		| 'experimental'
		| 'success'
		| 'error'
		| 'security';

	type AdmonitionColor = 'info' | 'success' | 'warning' | 'error' | 'important';

	const {
		kind,
		title,
		color,
		icon,
		children,
		childrenClasses,
		bold = false,
	}: {
		kind: AdmonitionType;
		title?: string;
		color?: AdmonitionColor;
		icon?: AdmonitionIconName;
		children?: Snippet;
		childrenClasses?: string;
		bold?: boolean;
	} = $props();

	const _title = $derived(title ?? kind);

	const _icon: AdmonitionIconName = $derived.by(() => {
		if (icon) return icon;
		if (kind === 'note') return 'note';
		if (kind === 'caution') return 'octagon-alert';
		if (kind === 'experimental') return 'flask';
		if (kind === 'important') return 'warning-message';
		if (kind === 'success') return 'check-circle';
		if (kind === 'security') return 'shield-alert';
		if (kind === 'tip') return 'lightbulb';
		if (kind === 'warning') return 'triangle-alert';
		if (kind === 'error') return 'x-circle';
		if (kind === 'info') return 'info-circle';
		if (kind === 'hint') return 'lightbulb';
		return 'note';
	});

	const _color: AdmonitionColor = $derived.by(() => {
		if (color) return color;
		if (['info', 'note', 'hint'].includes(kind)) return 'info';
		if (['tip', 'success'].includes(kind)) return 'success';
		if (kind === 'warning') return 'warning';
		if (['caution', 'error'].includes(kind)) return 'error';
		if (['security', 'experimental', 'important'].includes(kind)) return 'important';
		return 'info';
	});

	const border = $derived.by(() => {
		if (_color === 'info') return bold ? 'border-info-9' : 'border-info-5';
		if (_color === 'success') return bold ? 'border-success-9' : 'border-success-5';
		if (_color === 'warning') return bold ? 'border-warning-9' : 'border-warning-5';
		if (_color === 'error') return bold ? 'border-error-9' : 'border-error-5';
		if (_color === 'important') return bold ? 'border-iris-9' : 'border-iris-5';
		return 'border-info-9';
	});

	const text = $derived.by(() => {
		if (_color === 'info') return bold ? 'bg-info-7/20 text-info-11' : 'bg-info-6/20 text-info-11/80';
		if (_color === 'success') return bold ? 'bg-success-7/20 text-success-11' : 'bg-success-6/20 text-success-11/80';
		if (_color === 'warning') return bold ? 'bg-warning-7/20 text-warning-11' : 'bg-warning-6/20 text-warning-11/80';
		if (_color === 'error') return bold ? 'bg-error-7/20 text-error-11' : 'bg-error-6/20 text-error-11/80';
		if (_color === 'important') return bold ? 'bg-iris-7/20 text-iris-11' : 'bg-iris-6/20 text-iris-11/80';
		return 'text-info-11';
	});
</script>

<div class="mx-auto my-8 rounded-card {bold ? 'border-2' : 'border'} {border}">
	<div class="flex items-center gap-2 p-2 pl-4 {text}">
		<span class="flex-none"><Icon icon={_icon} class="h-4 w-4 !stroke-2" /></span>
		<span class:capitalize={!title}>{_title}</span>
	</div>

	{#if children}
		<div class="{childrenClasses ?? 'px-4 py-3'}{bold ? '' : ' text-gray-11'}">
			{@render children()}
		</div>
	{/if}
</div>
