"use client";

import { useCallback, useEffect, useState } from "react";

export type AtlasTheme = "light" | "dark";

export const ATLAS_THEME_STORAGE_KEY = "atlas-theme";
export const ATLAS_DEFAULT_THEME: AtlasTheme = "light";

/**
 * Small inline script (stringified) that runs before hydration to apply the
 * stored Atlas theme to <html>, preventing a light/dark flash on first paint.
 */
export const atlasThemeScript = `(() => {
	try {
		const stored = localStorage.getItem("${ATLAS_THEME_STORAGE_KEY}");
		const theme = stored === "light" || stored === "dark" ? stored : "${ATLAS_DEFAULT_THEME}";
		const root = document.documentElement;
		root.classList.toggle("dark", theme === "dark");
		root.style.colorScheme = theme;
	} catch (_) {}
})();`;

export function getStoredAtlasTheme(): AtlasTheme {
	if (typeof window === "undefined") {
		return ATLAS_DEFAULT_THEME;
	}

	const stored = window.localStorage.getItem(ATLAS_THEME_STORAGE_KEY);
	return stored === "light" || stored === "dark" ? stored : ATLAS_DEFAULT_THEME;
}

export function applyAtlasTheme(theme: AtlasTheme): void {
	if (typeof document === "undefined") {
		return;
	}

	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
}

export function useAtlasTheme(): {
	theme: AtlasTheme;
	setTheme: (theme: AtlasTheme) => void;
	toggleTheme: () => void;
	/** False until client storage has been read — use to avoid hydration mismatches. */
	mounted: boolean;
} {
	// Must match SSR output; localStorage is applied in useEffect only.
	const [theme, setThemeState] = useState<AtlasTheme>(ATLAS_DEFAULT_THEME);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const initial = getStoredAtlasTheme();
		setThemeState(initial);
		applyAtlasTheme(initial);
		setMounted(true);
	}, []);

	const setTheme = useCallback((next: AtlasTheme) => {
		setThemeState(next);
		applyAtlasTheme(next);
		try {
			window.localStorage.setItem(ATLAS_THEME_STORAGE_KEY, next);
		} catch {
			// Ignore storage failures (private mode, etc.)
		}
	}, []);

	const toggleTheme = useCallback(() => {
		setThemeState((prev) => {
			const next: AtlasTheme = prev === "dark" ? "light" : "dark";
			applyAtlasTheme(next);
			try {
				window.localStorage.setItem(ATLAS_THEME_STORAGE_KEY, next);
			} catch {
				// Ignore storage failures.
			}
			return next;
		});
	}, []);

	return { theme, setTheme, toggleTheme, mounted };
}
