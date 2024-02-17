<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { ImageCrop, type CropValue } from '$lib/image/client';
	import { logger } from '$lib/logging/client';
	import AvatarUploader from './AvatarUploader.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import { updateAvatarCrop } from './avatar/crop.json';
	import { deleteAvatar } from './avatar/upload.json';

	export let data;

	let avatarEditorOpen: 'crop' | 'upload' | null = null;
	let triggerAvatarUploadCancel = () => {};

	const updateAvatar = (img: DB.User['avatar']) => {
		// invalidateAll(); if using the avatar outside this component
		data.user.avatar = img;
	};

	const updatingAvatarCrop = updateAvatarCrop();
	const deletingAvatar = deleteAvatar();

	const saveToDB = async ({ crop }: { crop: CropValue }) => {
		const { error: saveError, data: saveData } = await updatingAvatarCrop.send({ crop });
		if (saveError) {
			logger.error(saveError);
		} else {
			updateAvatar(saveData.savedImg);
			editAvatarOpen.set(false);
		}
	};

	const {
		elements: {
			portalled: delConfirmPortalled,
			overlay: delConfirmOverlay,
			content: delConfirmContent,
			title: delConfirmTitle,
			description: delConfirmDescription,
			close: delConfirmClose,
		},
		states: { open: delConfirmOpen },
	} = createDialog({ forceVisible: true });

	const {
		elements: { portalled: editAvatarPortalled, overlay: editAvatarOverlay, content: editAvatarContent },
		states: { open: editAvatarOpen },
	} = createDialog({
		forceVisible: true,
		onOpenChange: ({ next }) => {
			if (next === false) {
				if (avatarEditorOpen === 'upload') {
					triggerAvatarUploadCancel();
					triggerAvatarUploadCancel = () => {};
				}
				avatarEditorOpen = null;
			}
			return next;
		},
	});

	const handleDelete = async () => {
		const { error: deleteError } = await deletingAvatar.send();
		if (deleteError) {
			logger.error(deleteError);
		} else {
			updateAvatar(null);
			editAvatarOpen.set(false);
			delConfirmOpen.set(false);
		}
	};
</script>

<div class="space-y-6">
	<h1 class="text-h4">Profile</h1>
	<ProfileCard
		nameForm={data.nameForm}
		user={data.user}
		editingAvatar={!!avatarEditorOpen}
		onEditorClicked={() => {
			if (data.user.avatar) avatarEditorOpen = 'crop';
			else avatarEditorOpen = 'upload';
			editAvatarOpen.set(true);
		}}
	/>
</div>

<div use:melt={$editAvatarPortalled}>
	{#if $editAvatarOpen}
		<div use:melt={$editAvatarOverlay} class="modal-overlay" />
		<div class="modal-content-position rounded-card overflow-hidden" use:melt={$editAvatarContent}>
			{#if avatarEditorOpen === 'crop' && data.user.avatar}
				<ImageCrop
					onDelete={() => delConfirmOpen.set(true)}
					crop={data.user.avatar.crop}
					url={data.user.avatar.url}
					disabled={$updatingAvatarCrop || $deletingAvatar}
					onCancel={() => editAvatarOpen.set(false)}
					onNew={() => {
						avatarEditorOpen = 'upload';
						editAvatarOpen.set(true);
					}}
					onSave={async (crop) => await saveToDB({ crop })}
				/>
			{:else if avatarEditorOpen === 'upload'}
				<AvatarUploader
					bind:cancel={triggerAvatarUploadCancel}
					onNewImg={(newImg) => {
						updateAvatar(newImg);
						editAvatarOpen.set(false);
					}}
				/>
			{/if}
		</div>
	{/if}
</div>

<div use:melt={$delConfirmPortalled}>
	{#if $delConfirmOpen}
		<div class="modal-overlay" use:melt={$delConfirmOverlay} />
		<div class="modal-content" use:melt={$delConfirmContent}>
			<h2 class="modal-title" use:melt={$delConfirmTitle}>Delete your avatar?</h2>
			<p class="modal-description" use:melt={$delConfirmDescription}>This cannot be undone.</p>
			<div class="modal-btns-wrapper">
				<button class="btn btn-hollow" use:melt={$delConfirmClose}>Cancel</button>
				<button class="btn btn-error" on:click={handleDelete}>Delete</button>
			</div>
		</div>
	{/if}
</div>
