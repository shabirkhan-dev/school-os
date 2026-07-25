"use client";

import { MotionConfig } from "motion/react";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

const MOTION_STORAGE_KEY = "school-os-animations";

type MotionContextValue = {
	/** Whether animations are enabled. When false, all motion + CSS animations are suppressed. */
	enabled: boolean;
	toggle: () => void;
	setEnabled: (next: boolean) => void;
};

const MotionContext = createContext<MotionContextValue | null>(null);

function readStored(): boolean {
	if (typeof window === "undefined") return true;
	try {
		const raw = window.localStorage.getItem(MOTION_STORAGE_KEY);
		if (raw === "off") return false;
	} catch {
		// ignore
	}
	return true;
}

/**
 * Global animation control.
 *
 * Wraps the tree in `MotionConfig` so every `motion` component respects the
 * toggle, and sets `data-animations` on a wrapper so CSS can kill
 * `tw-animate-css` keyframes and transitions in one shot.
 *
 * Usage:
 * ```tsx
 * <MotionProvider>{children}</MotionProvider>
 * ```
 *
 * Then anywhere:
 * ```tsx
 * const { enabled, toggle } = useMotion();
 * ```
 */
export function MotionProvider({ children }: { children: ReactNode }) {
	const [enabled, setEnabledState] = useState(true);

	useEffect(() => {
		setEnabledState(readStored());
	}, []);

	const setEnabled = useCallback((next: boolean) => {
		setEnabledState(next);
		try {
			window.localStorage.setItem(MOTION_STORAGE_KEY, next ? "on" : "off");
		} catch {
			// ignore
		}
	}, []);

	const toggle = useCallback(() => {
		setEnabledState((prev) => {
			const next = !prev;
			try {
				window.localStorage.setItem(MOTION_STORAGE_KEY, next ? "on" : "off");
			} catch {
				// ignore
			}
			return next;
		});
	}, []);

	const value = useMemo<MotionContextValue>(
		() => ({ enabled, toggle, setEnabled }),
		[enabled, toggle, setEnabled],
	);

	return (
		<MotionContext.Provider value={value}>
			{/*
				MotionConfig with reducedMotion="always" tells every <motion.*>
				component to skip enter/exit/layout animations — the single
				kill-switch for all Framer Motion usage in the tree.
			*/}
			<MotionConfig reducedMotion={enabled ? "never" : "always"}>
				<div data-animations={enabled ? "on" : "off"} style={{ display: "contents" }}>
					{children}
				</div>
			</MotionConfig>
		</MotionContext.Provider>
	);
}

export function useMotion(): MotionContextValue {
	const ctx = useContext(MotionContext);
	if (!ctx) {
		throw new Error("useMotion must be used within MotionProvider");
	}
	return ctx;
}
