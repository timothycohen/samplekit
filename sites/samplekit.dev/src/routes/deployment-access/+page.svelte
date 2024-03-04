<script lang="ts">
	import { enhance } from '$app/forms';
	import { InputMessage } from '$lib/components';
	import { PassInput } from '$routes/(auth)/components';

	let at = '';
	export let data;
	export let form;
</script>

<div class="page grid place-content-center">
	{#if !data.authorized}
		<form use:enhance action="?/signin" method="post" class="max-w-sm">
			<input type="text" name="username" value="deployment_access_token" class="hidden" />

			<label for="password" class="text-center text-xl font-bold">Access Token</label>
			<PassInput
				value={at}
				onChange={(e) => (at = e.currentTarget.value)}
				name_id="password"
				invalid={!at}
				autocomplete="current-password"
				disabled={false}
				attrs={{ required: true }}
			/>
			<button class="btn btn-accent h-10 w-full py-0 transition-colors" type="submit"> Sign in </button>
		</form>
	{:else}
		<form action="?/signout" method="post" use:enhance>
			<button type="submit" class="btn btn-hollow h-10 w-full py-0 transition-colors"> Sign Out </button>
		</form>
	{/if}

	<InputMessage {form} failOnly />
</div>
