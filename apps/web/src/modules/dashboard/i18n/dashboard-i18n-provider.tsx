"use client";

import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { cn } from "@/lib/utils";
import {
	createDashboardTranslator,
	type DashboardMessageKey,
	type DashboardTranslator,
} from "./create-dashboard-translator";
import {
	DASHBOARD_LOCALE_STORAGE_KEY,
	type DashboardLocale,
	dashboardDir,
	dashboardIntlLocale,
	isDashboardLocale,
} from "./dashboard-i18n.types";

const notoSans = Noto_Sans({
	subsets: ["latin"],
	variable: "--font-dashboard-sans",
	display: "swap",
});

/** UI Arabic/Urdu — pairs with Noto Sans (Latin) for mixed org names and numbers. */
const notoSansArabic = Noto_Sans_Arabic({
	subsets: ["arabic"],
	variable: "--font-dashboard-urdu",
	display: "swap",
	weight: ["400", "500", "600", "700"],
	adjustFontFallback: true,
});

type DashboardI18nContextValue = {
	locale: DashboardLocale;
	dir: "ltr" | "rtl";
	intlLocale: string;
	setLocale: (locale: DashboardLocale) => void;
	t: DashboardTranslator;
};

const DashboardI18nContext = createContext<DashboardI18nContextValue | null>(null);

function readStoredLocale(): DashboardLocale {
	if (typeof window === "undefined") return "en";
	try {
		const raw = sessionStorage.getItem(DASHBOARD_LOCALE_STORAGE_KEY);
		if (raw && isDashboardLocale(raw)) return raw;
	} catch {
		// ignore
	}
	return "en";
}

export function DashboardI18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<DashboardLocale>("en");

	useEffect(() => {
		setLocaleState(readStoredLocale());
	}, []);

	const setLocale = useCallback((next: DashboardLocale) => {
		setLocaleState(next);
		try {
			sessionStorage.setItem(DASHBOARD_LOCALE_STORAGE_KEY, next);
		} catch {
			// ignore
		}
	}, []);

	const value = useMemo((): DashboardI18nContextValue => {
		const dir = dashboardDir(locale);
		return {
			locale,
			dir,
			intlLocale: dashboardIntlLocale(locale),
			setLocale,
			t: createDashboardTranslator(locale),
		};
	}, [locale, setLocale]);

	return <DashboardI18nContext.Provider value={value}>{children}</DashboardI18nContext.Provider>;
}

export function useDashboardI18n(): DashboardI18nContextValue {
	const ctx = useContext(DashboardI18nContext);
	if (!ctx) {
		throw new Error("useDashboardI18n must be used within DashboardI18nProvider");
	}
	return ctx;
}

export function useDashboardT() {
	return useDashboardI18n().t;
}

export type { DashboardMessageKey };

export function dashboardLocaleFontVariables(): string {
	return `${notoSans.variable} ${notoSansArabic.variable}`;
}

export function dashboardLocaleClassName(locale: DashboardLocale): string {
	const fonts = dashboardLocaleFontVariables();
	return locale === "ur"
		? cn(
				fonts,
				"font-[family-name:var(--font-dashboard-urdu),var(--font-dashboard-sans),system-ui,sans-serif]",
			)
		: cn(fonts, "font-[family-name:var(--font-dashboard-sans),system-ui,sans-serif]");
}
