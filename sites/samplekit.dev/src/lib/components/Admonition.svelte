<script lang="ts">
	import I, { type Icon } from '$lib/icons';
	import { assertUnreachable, cap } from '$lib/utils/common';
	import type { Snippet } from 'svelte';

	type Kind =
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

	type Color = 'info' | 'success' | 'warning' | 'error' | 'important';

	const kindToIcon = (kind: Kind): Icon => {
		switch (kind) {
			case 'note':
				return I.StickyNote;
			case 'caution':
				return I.OctagonAlert;
			case 'experimental':
				return I.FlaskConical;
			case 'important':
				return I.MessageSquareWarning;
			case 'success':
				return I.CircleCheck;
			case 'security':
				return I.ShieldAlert;
			case 'tip':
				return I.Lightbulb;
			case 'warning':
				return I.TriangleAlert;
			case 'error':
				return I.CircleX;
			case 'info':
				return I.Info;
			case 'hint':
				return I.Lightbulb;
		}
		assertUnreachable(kind);
	};

	const kindToColor = (kind: Kind): Color => {
		switch (kind) {
			case 'note':
			case 'info':
			case 'hint':
				return 'info';
			case 'tip':
			case 'success':
				return 'success';
			case 'warning':
				return 'warning';
			case 'caution':
			case 'error':
				return 'error';
			case 'security':
			case 'experimental':
			case 'important':
				return 'important';
		}
		assertUnreachable(kind);
	};

	const kindToTitle = (kind: Kind): Capitalize<Kind> => cap(kind);

	type Props = (
		| {
				kind: Kind;
				title?: string;
				color?: Color;
				icon?: Icon;
		  }
		| {
				kind?: never;
				title: string;
				color: Color;
				icon: Icon;
		  }
	) & {
		children?: Snippet;
		childrenClass?: string;
		bold?: boolean;
	};

	const { kind, title, color, icon, children, childrenClass, bold = false }: Props = $props();

	// not sure why TS can't figure out that if the left doesn't exist, kind must exist
	const IconD = $derived(icon ?? kindToIcon(kind as Kind));
	const titleD = $derived(title ?? kindToTitle(kind as Kind));
	const colorD = $derived(color ?? kindToColor(kind as Kind));

	const borderClass = $derived.by(() => {
		if (colorD === 'info') return bold ? 'border-info-9' : 'border-info-5';
		if (colorD === 'success') return bold ? 'border-success-9' : 'border-success-5';
		if (colorD === 'warning') return bold ? 'border-warning-9' : 'border-warning-5';
		if (colorD === 'error') return bold ? 'border-error-9' : 'border-error-5';
		if (colorD === 'important') return bold ? 'border-iris-9' : 'border-iris-5';
		return 'border-info-9';
	});

	const textClass = $derived.by(() => {
		if (colorD === 'info') return bold ? 'bg-info-7/20 text-info-11' : 'bg-info-6/20 text-info-11/80';
		if (colorD === 'success') return bold ? 'bg-success-7/20 text-success-11' : 'bg-success-6/20 text-success-11/80';
		if (colorD === 'warning') return bold ? 'bg-warning-7/20 text-warning-11' : 'bg-warning-6/20 text-warning-11/80';
		if (colorD === 'error') return bold ? 'bg-error-7/20 text-error-11' : 'bg-error-6/20 text-error-11/80';
		if (colorD === 'important') return bold ? 'bg-iris-7/20 text-iris-11' : 'bg-iris-6/20 text-iris-11/80';
		return 'text-info-11';
	});
</script>

<div class="mx-auto my-8 rounded-card {bold ? 'border-2' : 'border'} {borderClass}">
	<div class="flex items-center gap-2 p-2 pl-4 {textClass}">
		<span class="flex-none"><IconD class="h-4 w-4 !stroke-2" /></span>
		<span>{titleD}</span>
	</div>

	{#if children}
		<div class="{childrenClass ?? 'px-4 py-3'}{bold ? '' : ' text-gray-11'}">
			{@render children()}
		</div>
	{/if}
</div>
