import { storeOnClient } from './sidebarStorage';

export class SidebarState {
	#open = $state() as boolean;

	constructor(initialState: boolean) {
		this.#open = initialState;
	}

	get open() {
		return this.#open;
	}

	set open(value: boolean) {
		this.#open = value;
		storeOnClient(value);
	}
}
