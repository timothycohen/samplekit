<script lang="ts">
	import { maxPizza, minPizza } from './pizza.ws.common';

	let { oninput, desiredPizzaCount = $bindable() }: { oninput: () => void; desiredPizzaCount: null | number } =
		$props();

	const onInput = (newVal: string, set: (val: string) => void) => {
		const num = Number(newVal);
		oninput();
		if (newVal === '') {
			desiredPizzaCount = null;
			set('');
		} else if (isNaN(num)) {
			return false;
		} else if (num > maxPizza) {
			desiredPizzaCount = maxPizza;
			set(maxPizza.toString());
		} else if (num < minPizza) {
			desiredPizzaCount = minPizza;
			set(minPizza.toString());
		} else {
			desiredPizzaCount = num;
			set(num.toString());
		}
	};
</script>

<input
	value={desiredPizzaCount}
	name="count"
	type="number"
	id="count"
	class="peer input-text"
	class:input-invalid={desiredPizzaCount !== null && (desiredPizzaCount > maxPizza || desiredPizzaCount < minPizza)}
	autocomplete={null}
	required
	onkeydown={(e) => {
		if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
	}}
	oninput={(e) => {
		const newVal = e.currentTarget.value;
		onInput(newVal, (v) => (e.currentTarget.value = v));
	}}
	onpaste={(e) => {
		e.preventDefault();
		const newVal = e.clipboardData?.getData('text') || '';
		onInput(newVal, (v) => (e.currentTarget.value = v));
	}}
/>
