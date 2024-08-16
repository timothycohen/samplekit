<script lang="ts">
	import { createDialog, melt } from '@melt-ui/svelte';
	import { Avatar } from '$lib/components';
	import AvatarEditor from './AvatarEditor.svelte';

	interface Props {
		avatar: DB.User['avatar'];
		onAvatarUpdate: (img: DB.User['avatar']) => void | Promise<void>;
	}

	const { avatar, onAvatarUpdate }: Props = $props();

	const updateAvatar = async (img: DB.User['avatar']) => {
		await onAvatarUpdate(img);
		editAvatarOpen.set(false);
	};

	const {
		elements: { portalled, overlay, content },
		states: { open: editAvatarOpen },
	} = createDialog({ forceVisible: true });
</script>

<Avatar editing={$editAvatarOpen} {avatar} size={150} editable onEditorClicked={() => editAvatarOpen.set(true)} />

<div use:melt={$portalled}>
	{#if $editAvatarOpen}
		<div use:melt={$overlay} class="modal-overlay"></div>
		<div class="modal-content-position overflow-hidden rounded-card" use:melt={$content}>
			<AvatarEditor {avatar} onCancel={() => editAvatarOpen.set(false)} {updateAvatar} />
		</div>
	{/if}
</div>
