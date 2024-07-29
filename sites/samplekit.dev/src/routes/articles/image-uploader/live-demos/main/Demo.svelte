<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { page } from '$app/stores';
	import { Avatar } from '$lib/components';
	import AvatarEditor from '$routes/account/profile/AvatarEditor.svelte';
	import Mock from './Mock.svelte';

	let user: DB.User | null = $state(null);
	page.subscribe(($page) => {
		user = $page.data['user'] ?? null;
	});

	const updateAvatar = (img: DB.User['avatar']) => {
		if (user) {
			user.avatar = img;
			editAvatarOpen.set(false);
		}
	};

	const {
		elements: { portalled, overlay, content },
		states: { open: editAvatarOpen },
	} = createDialog({ forceVisible: true });
</script>

{#if !user}
	<Mock />
{:else}
	<Avatar
		editing={$editAvatarOpen}
		avatar={user.avatar}
		size={300}
		editable
		onEditorClicked={() => editAvatarOpen.set(true)}
	/>

	<div use:melt={$portalled}>
		{#if $editAvatarOpen}
			<div use:melt={$overlay} class="modal-overlay"></div>
			<div class="modal-content-position overflow-hidden rounded-card" use:melt={$content}>
				<AvatarEditor avatar={user.avatar} onCancel={() => editAvatarOpen.set(false)} {updateAvatar} />
			</div>
		{/if}
	</div>
{/if}
