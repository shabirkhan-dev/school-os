/** Deterministic PRNG for reproducible demo data. */
export function mulberry32(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), 1 | state);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function pick<T>(rng: () => number, items: readonly T[]): T {
	const item = items[Math.floor(rng() * items.length)];
	if (item === undefined) throw new Error('pick() called with empty array');
	return item;
}

export function pickWeighted<T>(
	rng: () => number,
	items: readonly { value: T; weight: number }[],
): T {
	const total = items.reduce((sum, item) => sum + item.weight, 0);
	let roll = rng() * total;
	for (const item of items) {
		roll -= item.weight;
		if (roll <= 0) return item.value;
	}
	return items[items.length - 1]?.value as T;
}

export function intBetween(rng: () => number, min: number, max: number): number {
	return Math.floor(rng() * (max - min + 1)) + min;
}

export function dateBetween(rng: () => number, start: Date, end: Date): Date {
	const startMs = start.getTime();
	const endMs = end.getTime();
	return new Date(startMs + rng() * (endMs - startMs));
}

export function formatDate(value: Date): string {
	return value.toISOString().slice(0, 10);
}
