"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
	DashboardI18nProvider,
	dashboardLocaleClassName,
	useDashboardI18n,
} from "./dashboard-i18n-provider";

type Props = {
	children: ReactNode;
	className?: string;
};

function DashboardI18nRoot({ children, className }: Props) {
	const { locale, dir } = useDashboardI18n();
	return (
		<div
			dir={dir}
			lang={locale === "ur" ? "ur" : "en"}
			className={cn(className, dashboardLocaleClassName(locale))}
		>
			{children}
		</div>
	);
}

/** Admin shell only — RTL/LTR + en/ur; public routes unchanged. */
export function DashboardI18nShell({ children, className }: Props) {
	return (
		<DashboardI18nProvider>
			<DashboardI18nRoot className={className}>{children}</DashboardI18nRoot>
		</DashboardI18nProvider>
	);
}
