<script lang="ts">
	import { Modal } from '$lib/components';
	import { ImageCrop, type CropValue } from '$lib/image/client';
	import AvatarUploader from './AvatarUploader.svelte';
	import ProfileCard from './ProfileCard.svelte';
	import { updateAvatarCrop } from './avatar/crop.json';
	import { deleteAvatar } from './avatar/upload.json';

	export let data;

	let avatarEditorOpen: 'crop' | 'upload' | null = null;
	let triggerAvatarUploadCancel = () => {};

	const cancel = () => {
		if (avatarEditorOpen === 'upload') {
			triggerAvatarUploadCancel();
			triggerAvatarUploadCancel = () => {};
		}
		avatarEditorOpen = null;
	};

	const updateAvatar = (img: DB.User['avatar']) => {
		// invalidateAll(); if using the avatar outside this component
		data.user.avatar = img;
	};

	const updatingAvatarCrop = updateAvatarCrop();
	const deletingAvatar = deleteAvatar();

	const saveToDB = async ({ crop }: { crop: CropValue }) => {
		const { error: saveError, data: saveData } = await updatingAvatarCrop.send({ crop });
		if (saveError) {
			console.error(saveError);
		} else {
			updateAvatar(saveData.savedImg);
			avatarEditorOpen = null;
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
		}}
	/>
</div>

<Modal
	open={!!avatarEditorOpen}
	onOutclick={cancel}
	onEscape={cancel}
	dialogClasses="modal-content-position rounded-card overflow-hidden"
>
	{#if avatarEditorOpen === 'crop' && data.user.avatar}
		<ImageCrop
			onDelete={async () => {
				const { error: deleteError } = await deletingAvatar.send();
				if (deleteError) {
					console.error(deleteError);
				} else {
					updateAvatar(null);
					avatarEditorOpen = null;
				}
			}}
			crop={data.user.avatar.crop}
			url={data.user.avatar.url}
			disabled={$updatingAvatarCrop || $deletingAvatar}
			onCancel={cancel}
			onNew={() => (avatarEditorOpen = 'upload')}
			onSave={async (crop) => await saveToDB({ crop })}
		/>
	{:else if avatarEditorOpen === 'upload'}
		<AvatarUploader
			bind:cancel={triggerAvatarUploadCancel}
			onNewImg={(newImg) => {
				updateAvatar(newImg);
				avatarEditorOpen = null;
			}}
		/>
	{/if}
</Modal>
