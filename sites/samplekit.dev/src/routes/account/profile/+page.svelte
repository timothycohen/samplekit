<script lang="ts">
	import ProfileCard from './ProfileCard.svelte';

	const { data } = $props();
</script>

<div class="space-y-6">
	<h1 class="text-h4">Profile</h1>
	<ProfileCard nameForm={data.nameForm} user={data.user} />
</div>
