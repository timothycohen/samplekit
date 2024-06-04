<script lang="ts">
	import { Pencil } from '$lib/styles/icons';

	export let editable = false;
	export let size: number;
	export let avatar: DB.User['avatar'];
	export let showEditButton = false;
	export let editing = false;
	export let onEditorClicked: (() => void) | undefined = undefined;

	$: imgStyles = avatar
		? `transform: translateX(-50%) translateY(-50%) rotate(${avatar.crop.rotation}deg);` +
			`height: ${avatar.crop.scale * size}px;` +
			`margin-left: ${(size * avatar.crop.aspect) / 2 + avatar.crop.position.x * size}px;` +
			`margin-top: ${size / 2 + avatar.crop.position.y * size}px; max-width: none;`
		: '';
</script>

{#if !editable}
	<div
		class="group relative overflow-hidden rounded-full"
		style="height:{size}px; width:{(avatar?.crop?.aspect ?? 1) * size}px;"
	>
		{#if avatar}
			<img style={imgStyles} src={avatar.url} alt="" referrerpolicy="no-referrer" />
		{:else}
			<div class="h-full w-full bg-black/10"></div>
		{/if}
		<div class="ring-gray-6 absolute inset-0 rounded-full ring-1 ring-inset"></div>
	</div>
{/if}

{#if editable}
	<button
		on:click={() => onEditorClicked?.()}
		class="group relative block overflow-hidden rounded-full"
		style="height:{size}px; width:{(avatar?.crop?.aspect ?? 1) * size}px;"
	>
		{#if avatar}
			<img style={imgStyles} src={avatar.url} alt="" referrerpolicy="no-referrer" />
		{:else}
			<div class="h-full w-full bg-black/10"></div>
		{/if}
		<div class="ring-gray-6 absolute inset-0 rounded-full ring-1 ring-inset"></div>

		<span
			class="absolute inset-0
			{size > 50 && !editing ? 'hidden group-hover:grid' : 'grid'}
			place-content-center bg-black/70 text-white"
		>
			<Pencil />
		</span>
		{#if size > 50 && showEditButton}
			<span
				class="bg-accent-9 text-accent-9-contrast absolute bottom-0 left-0 right-0 text-center"
				style={size > 100 ? 'padding: 5px 0' : ''}
			>
				Edit
			</span>
		{/if}
	</button>
{/if}
