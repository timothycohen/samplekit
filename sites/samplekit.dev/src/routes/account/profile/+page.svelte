<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import AvatarEditor from './AvatarEditor.svelte';
	import ProfileCard from './ProfileCard.svelte';

	export let data;

	const updateAvatar = (img: DB.User['avatar']) => {
		data.user.avatar = img;
		editAvatarOpen.set(false);
	};

	const {
		elements: { portalled, overlay, content },
		states: { open: editAvatarOpen },
	} = createDialog({ forceVisible: true });
</script>

<div class="space-y-6">
	<h1 class="text-h4">Profile</h1>
	<ProfileCard
		nameForm={data.nameForm}
		user={data.user}
		editingAvatar={$editAvatarOpen}
		onEditorClicked={() => editAvatarOpen.set(true)}
	/>
</div>

<div use:melt={$portalled}>
	{#if $editAvatarOpen}
		<div use:melt={$overlay} class="modal-overlay" />
		<div class="modal-content-position rounded-card overflow-hidden" use:melt={$content}>
			<AvatarEditor avatar={data.user.avatar} onCancel={() => editAvatarOpen.set(false)} {updateAvatar} />
		</div>
	{/if}
</div>
