export class StateController {
	#r_state: 'idle' | 'active' | 'debounce' | 'fixing' = $state('idle');
	#fixDelayMs: number;
	#fixDurationMs: number;
	#untilFix: null | ReturnType<typeof setTimeout> = null;
	#untilFixOver: null | ReturnType<typeof setTimeout> = null;
	#onFixing?: () => void;
	#needsFix: () => boolean;

	constructor(a: { fixDelayMs: number; fixDurationMs: number; needsFix: () => boolean; onFixing?: () => void }) {
		this.#fixDelayMs = a.fixDelayMs;
		this.#fixDurationMs = a.fixDurationMs;
		this.#onFixing = a.onFixing;
		this.#needsFix = a.needsFix;
	}

	start() {
		if (this.#untilFix) clearTimeout(this.#untilFix);
		if (this.#untilFixOver) clearTimeout(this.#untilFixOver);
		this.#r_state = 'active';
	}

	finish() {
		if (this.#untilFix) clearTimeout(this.#untilFix);
		if (this.#untilFixOver) clearTimeout(this.#untilFixOver);
		this.#r_state = 'debounce';
		this.#untilFix = setTimeout(() => {
			if (!this.#needsFix()) {
				this.#r_state = 'idle';
				return;
			}

			this.#r_state = 'fixing';
			this.#onFixing?.();
			this.#untilFixOver = setTimeout(() => {
				this.#r_state = 'idle';
			}, this.#fixDurationMs);
		}, this.#fixDelayMs);
	}

	get r_state() {
		return this.#r_state;
	}
}
