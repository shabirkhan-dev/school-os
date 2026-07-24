import type { DashboardLocale } from "./dashboard-i18n.types";
import type { DashboardMessages } from "./messages/en";
import { enMessages } from "./messages/en";
import { urMessages } from "./messages/ur";

const catalogs: Record<DashboardLocale, DashboardMessages> = {
	en: enMessages,
	ur: urMessages,
};

type ParamValue = string | number;

function interpolate(template: string, params?: Record<string, ParamValue>): string {
	if (!params) return template;
	return template.replace(/\{(\w+)\}/g, (_, key: string) => {
		const value = params[key];
		return value === undefined ? `{${key}}` : String(value);
	});
}

type NestedKeyOf<T> = T extends object
	? {
			[K in keyof T & string]: T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K;
		}[keyof T & string]
	: never;

export type DashboardMessageKey = NestedKeyOf<DashboardMessages>;

function resolvePath(messages: DashboardMessages, path: string): string | undefined {
	const parts = path.split(".");
	let current: unknown = messages;
	for (const part of parts) {
		if (current === null || typeof current !== "object" || !(part in current)) {
			return undefined;
		}
		current = (current as Record<string, unknown>)[part];
	}
	return typeof current === "string" ? current : undefined;
}

export function createDashboardTranslator(locale: DashboardLocale) {
	const messages = catalogs[locale];

	return function t(key: DashboardMessageKey, params?: Record<string, ParamValue>): string {
		const value = resolvePath(messages, key);
		if (!value) {
			const fallback = resolvePath(enMessages, key);
			return fallback ? interpolate(fallback, params) : key;
		}
		return interpolate(value, params);
	};
}

export type DashboardTranslator = ReturnType<typeof createDashboardTranslator>;
