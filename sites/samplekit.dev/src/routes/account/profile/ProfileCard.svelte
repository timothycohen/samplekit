<script lang="ts">
	import { nameSchema } from '$routes/(auth)/validators';
	import EditableAvatar from './EditableAvatar.svelte';
	import EditableName from './EditableName.svelte';
	import type { SuperValidated } from '$lib/superforms/client';

	export let user: DB.User;
	export let nameForm: SuperValidated<typeof nameSchema>;
</script>

<div class="rounded-card shadow-4 mx-auto max-w-sm p-8 md:mx-0">
	<div class="relative mx-auto w-36 rounded-full">
		<EditableAvatar {user} />
	</div>

	<EditableName {user} {nameForm} />

	<div class="flex flex-wrap items-center justify-between px-3 text-sm">
		<span>Joined On</span>
		<span>{user.joinedOn.toLocaleDateString()}</span>
	</div>
</div>
