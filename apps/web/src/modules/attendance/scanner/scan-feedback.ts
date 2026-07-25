/**
 * Lightweight scan feedback: short beeps via the Web Audio API and haptic
 * vibration where available. Kept dependency-free and safe to call on the
 * client only.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
	if (typeof window === "undefined") return null;
	try {
		if (!audioCtx) {
			const Ctor =
				window.AudioContext ??
				(window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
			if (!Ctor) return null;
			audioCtx = new Ctor();
		}
		return audioCtx;
	} catch {
		return null;
	}
}

function beep(frequency: number, durationMs: number) {
	const ctx = getAudioContext();
	if (!ctx) return;
	try {
		if (ctx.state === "suspended") void ctx.resume();
		const oscillator = ctx.createOscillator();
		const gain = ctx.createGain();
		oscillator.type = "sine";
		oscillator.frequency.value = frequency;
		gain.gain.setValueAtTime(0.08, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + durationMs / 1000);
		oscillator.connect(gain);
		gain.connect(ctx.destination);
		oscillator.start();
		oscillator.stop(ctx.currentTime + durationMs / 1000);
	} catch {
		// Audio not available — ignore.
	}
}

function vibrate(pattern: number | number[]) {
	if (typeof navigator !== "undefined" && "vibrate" in navigator) {
		try {
			navigator.vibrate(pattern);
		} catch {
			// Vibration not available — ignore.
		}
	}
}

export const scanFeedback = {
	/** Positive feedback for a successful scan. */
	success() {
		beep(880, 120);
		vibrate(40);
	},
	/** Neutral feedback when a student was already marked. */
	alreadyMarked() {
		beep(520, 100);
		vibrate(30);
	},
	/** Negative feedback for an unknown or invalid code. */
	error() {
		beep(220, 200);
		vibrate([60, 40, 60]);
	},
};
