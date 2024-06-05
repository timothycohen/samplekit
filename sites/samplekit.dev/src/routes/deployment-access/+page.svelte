<script lang="ts">
	import { enhance } from '$app/forms';
	import { InputMessage } from '$lib/components';
	import { pluralize } from '$lib/utils/common/language.js';
	import { PassInput } from '$routes/(auth)/components';

	let at = $state('');
	interface Props { data: any, form: any }

	let { data, form }: Props = $props();
</script>

<div class="grid place-content-center page">
	{#if !data.deploymentAuth.authenticated}
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
		<p>You have {data.deploymentAuth.sessionCount} {pluralize('session', data.deploymentAuth.sessionCount)}</p>
		<form action="?/signout" method="post" use:enhance>
			<button type="submit" class="btn btn-hollow h-10 w-full py-0 transition-colors"> Sign Out </button>
		</form>
		<form action="?/signoutAll" method="post" use:enhance>
			<button type="submit" class="btn btn-hollow h-10 w-full py-0 transition-colors"> Sign Out Everywhere</button>
		</form>
	{/if}

	<InputMessage {form} failOnly />
</div>
