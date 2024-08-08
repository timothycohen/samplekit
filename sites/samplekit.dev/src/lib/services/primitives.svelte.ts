export class BoolService {
	#true = $state() as { true: boolean };

	constructor(initial: boolean) {
		this.#true = { true: initial };
	}

	get true() {
		return this.#true.true;
	}
	get false() {
		return !this.#true.true;
	}
	set true(value) {
		this.#true.true = value;
	}
	toggle() {
		this.true = !this.true;
		return this.true;
	}
}
