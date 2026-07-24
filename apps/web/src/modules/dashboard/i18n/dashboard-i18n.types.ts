export const DASHBOARD_LOCALES = ["en", "ur"] as const;

export type DashboardLocale = (typeof DASHBOARD_LOCALES)[number];

export const DASHBOARD_LOCALE_STORAGE_KEY = "school-os-dashboard-locale";

export function isDashboardLocale(value: string): value is DashboardLocale {
	return (DASHBOARD_LOCALES as readonly string[]).includes(value);
}

export function dashboardDir(locale: DashboardLocale): "ltr" | "rtl" {
	return locale === "ur" ? "rtl" : "ltr";
}

export function dashboardIntlLocale(locale: DashboardLocale): string {
	return locale === "ur" ? "ur-PK" : "en-US";
}
