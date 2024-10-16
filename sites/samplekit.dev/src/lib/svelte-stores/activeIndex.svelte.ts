type Props = {
	max: number;
	active?: number;
	onChange?: (prev: number, next: number) => number;
};

export class ActiveIndex {
	#max: number;
	#active = $state() as number;
	#onChange: (prev: number, next: number) => number;

	constructor({ max, active = 0, onChange }: Props) {
		this.#max = max;
		this.#active = active;
		if (onChange) {
			this.#onChange = onChange;
		} else {
			this.#onChange = (_prev, next) => next;
		}
	}

	get active() {
		return this.#active;
	}

	inc = () => {
		const prev = this.#active;
		const next = prev === this.#max - 1 ? 0 : prev + 1;
		this.#active = this.#onChange(prev, next);
	};

	dec = () => {
		const prev = this.#active;
		const next = prev === 0 ? this.#max - 1 : prev - 1;
		this.#active = this.#onChange(prev, next);
	};

	set = (i: number) => {
		const prev = this.#active;
		const next = Math.max(0, Math.min(i, this.#max - 1));
		this.#active = this.#onChange(prev, next);
	};

	get max() {
		return this.#max;
	}
}
