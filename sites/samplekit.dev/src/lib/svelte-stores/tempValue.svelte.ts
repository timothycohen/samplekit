export class TempValue<StoreVal, BeforeFinishCBReturn = void> {
	#value: StoreVal | null = $state(null);
	beforeFinishCb?: (val: StoreVal) => BeforeFinishCBReturn;
	duration: number;
	#timeout: null | ReturnType<typeof setTimeout> = null;

	constructor(a: { duration: number; beforeFinishCb?: (val: StoreVal) => BeforeFinishCBReturn }) {
		this.duration = a.duration;
		this.beforeFinishCb = a.beforeFinishCb;
	}

	set value(value: StoreVal | null) {
		if (this.#timeout) clearInterval(this.#timeout);
		this.#value = value;
		if (value !== null) {
			this.#timeout = setTimeout(() => {
				this.beforeFinishCb?.(value);
				this.#value = null;
			}, this.duration);
		}
	}

	get value() {
		return this.#value;
	}
}
