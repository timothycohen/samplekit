<script lang="ts">
	import { type nameSchema } from '$routes/(auth)/validators';
	import EditableAvatar from './EditableAvatar.svelte';
	import EditableName from './EditableName.svelte';
	import type { SuperValidated } from '$lib/superforms/client';

	interface Props {
		user: DB.User;
		nameForm: SuperValidated<typeof nameSchema>;
	}

	const { user, nameForm }: Props = $props();
</script>

<div class="mx-auto max-w-sm rounded-card p-8 shadow-4 md:mx-0">
	<div class="relative mx-auto w-36 rounded-full">
		<EditableAvatar {user} onAvatarUpdate={(img) => (user.avatar = img)} />
	</div>

	<EditableName {user} {nameForm} />

	<div class="flex flex-wrap items-center justify-between px-3 text-sm">
		<span>Joined On</span>
		<span>{user.joinedOn.toLocaleDateString()}</span>
	</div>
</div>
