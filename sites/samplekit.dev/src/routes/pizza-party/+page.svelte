<script lang="ts">
	import { useWsService } from '$lib/ws/client/init';
	import type { Result } from '$lib/utils/common';
	import type { PizzaRes } from './ws.client';

	const { ws } = useWsService();

	let pizzaOrders: Array<string> = [];
	let warning = '';
	let pizzaCount: number | null = 0;
	let party = false;

	const onPizza = ({ data, error }: Result<PizzaRes>) => {
		if (data) {
			pizzaOrders = [...pizzaOrders, data.pizza];
		} else if (error) {
			warning = error.message;
		}
	};

	$: if ($ws) $ws.on('pizza', onPizza);

	const getPizza = () => {
		$ws?.emit('pizza', { count: pizzaCount ?? 0, party });
		pizzaCount = 0;
	};

	const onInput = (e: Event & { currentTarget: EventTarget & HTMLInputElement }, str: string) => {
		const num = Number(str);
		if (str === '') {
			pizzaCount = null;
			e.currentTarget.value = '';
			warning = '';
		} else if (isNaN(num)) {
			return false;
		} else if (num > 10) {
			pizzaCount = 10;
			e.currentTarget.value = '10';
			warning = 'Max 10 pizzas';
		} else if (num < 1) {
			pizzaCount = 1;
			e.currentTarget.value = '1';
			warning = 'Min 1 pizza';
		} else {
			pizzaCount = num;
			e.currentTarget.value = num.toString();
			warning = '';
		}
	};
</script>

<div class="max-w-96">
	{#if !$ws}
		<p>Loading pizza comms...</p>
	{:else}
		<label class="block">
			How many pizzas do you want?
			<input
				type="number"
				class="input-text peer"
				value={pizzaCount}
				on:keydown={(e) => {
					if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
				}}
				on:input={(e) => {
					onInput(e, e.currentTarget.value);
				}}
				on:paste|preventDefault={(e) => {
					const val = e.clipboardData?.getData('text') ?? null;
					onInput(e, val || '');
				}}
			/>
		</label>
		<div class="input-subtext text-error-9">{warning}</div>

		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="space-x-2">
				<label for="party">Make it a party!</label>
				<input type="checkbox" id="party" bind:checked={party} />
			</div>

			<button disabled={!pizzaCount} class="btn btn-accent" on:click={getPizza}> Get Pizza </button>
		</div>
	{/if}

	<div>
		{#each pizzaOrders as pizzaOrder}
			<p>{pizzaOrder}</p>
		{/each}
	</div>
</div>
