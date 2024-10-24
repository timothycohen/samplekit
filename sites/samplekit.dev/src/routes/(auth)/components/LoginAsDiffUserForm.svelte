<script lang="ts">
	import { actionsMap } from '$routes/(auth)';
</script>

<form action={actionsMap.logoutCurrent} method="post">
	<button type="submit" class="link">
		<small>Sign in as a different user</small>
	</button>
</form>
