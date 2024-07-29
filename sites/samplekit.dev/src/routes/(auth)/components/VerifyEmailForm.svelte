<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { InputMessage } from '$lib/components';

	interface Props {
		email: string;
		action: App.Form.Action;
	}

	const { email, action }: Props = $props();

	let submitted = $state(false);
	$effect(() => {
		submitted = !!$page.url.searchParams.get('success');
	});
</script>

<div class="alert-wrapper alert-wrapper-info">
	Send a confirmation email to <strong class="font-extrabold text-accent-9 underline">{email}</strong>.
</div>
<form {action} method="post" use:enhance onsubmit={() => (submitted = true)}>
	<button class="btn btn-accent {submitted ? 'font-semibold' : ''}" disabled={submitted} type="submit">
		{submitted ? 'Sent!' : 'Send'}
	</button>
	<InputMessage failOnly useParams />
</form>
