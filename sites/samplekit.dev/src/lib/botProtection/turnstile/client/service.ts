import { defineContext } from '$lib/utils/client';
import { turnstileInput, type TurnstileForm } from './actions';
import { createTurnstile, type TurnstileStore } from './stores';

const [getService, setService] = defineContext<{
	turnstile: TurnstileStore;
	turnstileInput: (node: HTMLFormElement, parameter: { form: TurnstileForm }) => void | { destroy?: () => void };
}>();

const createTurnstileService = () => {
	const turnstile = createTurnstile({ resizeProps: { width: '100%', height: '65px' } });

	setService({
		turnstile,
		turnstileInput: (node: HTMLFormElement, { form }: { form: TurnstileForm }) =>
			turnstileInput(node, { form, turnstile }),
	});
};

export { createTurnstileService, getService as useTurnstileService };
