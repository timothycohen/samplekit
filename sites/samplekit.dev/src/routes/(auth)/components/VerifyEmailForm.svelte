<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { InputMessage } from '$lib/components';

	export let email: string;
	export let action: App.Form.Action;

	$: submitted = !!$page.url.searchParams.get('success');
</script>

<div class="alert-wrapper alert-wrapper-info">
	Send a confirmation email to <strong class="text-accent-9 font-extrabold underline">{email}</strong>.
</div>
<form {action} method="post" use:enhance on:submit={() => (submitted = true)}>
	<button class="btn btn-accent {submitted ? 'font-semibold' : ''}" disabled={submitted} type="submit">
		{submitted ? 'Sent!' : 'Send'}
	</button>
	<InputMessage failOnly useParams />
</form>
