<script lang="ts">
	import I from '$lib/icons';
	import { mediaStyles, outerStyles } from '$lib/image/client';

	interface Props {
		editable?: boolean;
		size: number;
		avatar: DB.User['avatar'];
		showEditButton?: boolean;
		editing?: boolean;
		onEditorClicked?: (() => void) | undefined;
	}

	const {
		editable = false,
		size,
		avatar,
		showEditButton = false,
		editing = false,
		onEditorClicked = undefined,
	}: Props = $props();

	const outerStyle = outerStyles({ shape: 'round', height: size });
</script>

{#if !editable}
	<div class="group" style={outerStyle}>
		{#if avatar}
			<img
				style={mediaStyles({ cropValue: avatar.crop, height: size })}
				src={avatar.url}
				alt=""
				referrerpolicy="no-referrer"
			/>
		{:else}
			<div class="h-full w-full bg-black/10"></div>
		{/if}
		<div class="absolute inset-0 rounded-full ring-1 ring-inset ring-gray-6"></div>
	</div>
{:else}
	<button onclick={() => onEditorClicked?.()} class="group block" style={outerStyle}>
		{#if avatar}
			<img
				style={mediaStyles({ cropValue: avatar.crop, height: size })}
				src={avatar.url}
				alt=""
				referrerpolicy="no-referrer"
			/>
		{:else}
			<div class="h-full w-full bg-black/10"></div>
		{/if}
		<div class="absolute inset-0 rounded-full ring-1 ring-inset ring-gray-6"></div>

		<span
			class="absolute inset-0
			{size > 50 && !editing ? 'hidden group-hover:grid' : 'grid'}
			place-content-center bg-black/70 text-white"
		>
			<I.Pencil />
		</span>
		{#if size > 50 && showEditButton}
			<span
				class="absolute bottom-0 left-0 right-0 bg-accent-9 text-center text-accent-9-contrast"
				style={size > 100 ? 'padding: 5px 0' : ''}
			>
				Edit
			</span>
		{/if}
	</button>
{/if}
