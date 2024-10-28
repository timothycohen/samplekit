<script lang="ts">
	import { onMount } from 'svelte';
	import { useWsCtx } from '$lib/ws/client';
	import PizzaInput from './PizzaInput.svelte';
	import PizzaList from './PizzaList.svelte';

	const wsClient = useWsCtx();

	let errMsg = $state('');
	let desiredPizzaCount: number | null = $state(null);
	let pizzaListEl: null | { addItems: (count: number) => void } = $state(null);

	onMount(() => {
		wsClient.pizza.addListener(({ data, error }) => {
			if (data) pizzaListEl?.addItems(data.pizzaCount);
			else errMsg = error.message;
		});
		return () => {
			wsClient.pizza.removeListener();
		};
	});

	const submitPizzaReq = (e: SubmitEvent) => {
		e.preventDefault();
		wsClient.pizza.sendMessage({ count: desiredPizzaCount ?? 0 });
		desiredPizzaCount = null;
	};
</script>

<div class="space-y-8">
	<div>
		<h2 class="text-center font-serif text-h2 text-accent-12">Pizza Party</h2>
		<PizzaList bind:this={pizzaListEl} />
	</div>

	<div class="text-center italic text-gray-11">
		Send some pizza to <strong class="not-italic text-gray-12 underline">everyone</strong> viewing this page!
	</div>

	<form action={null} class="mx-auto max-w-96 text-center" onsubmit={submitPizzaReq}>
		<label for="count" class="input-label">How many pizzas should we cook up?</label>
		<PizzaInput bind:desiredPizzaCount oninput={() => (errMsg = '')} />
		<div class="input-subtext text-error-9">{errMsg}</div>

		<div class="flex flex-wrap items-center justify-between gap-4">
			<button class="btn btn-accent w-full" type="submit" disabled={!desiredPizzaCount || !wsClient.active}>
				{wsClient.active ? 'Order Pizza' : 'Loading Pizza Communication Server...'}
			</button>
		</div>
	</form>
</div>
