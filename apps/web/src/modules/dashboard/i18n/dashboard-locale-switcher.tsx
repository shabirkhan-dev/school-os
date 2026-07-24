"use client";

import { LanguageSkillIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@school-os/ui/components/dropdown-menu";
import { cn } from "@/lib/utils";
import type { DashboardLocale } from "./dashboard-i18n.types";
import { useDashboardI18n } from "./dashboard-i18n-provider";

type Props = {
	className?: string;
};

export function DashboardLocaleSwitcher({ className }: Props) {
	const { locale, setLocale, t } = useDashboardI18n();

	const options: { id: DashboardLocale; label: string }[] = [
		{ id: "en", label: t("locale.english") },
		{ id: "ur", label: t("locale.urdu") },
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={(props) => (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className={cn("text-dashboard-text-muted", className)}
						aria-label={t("locale.switchAria")}
						{...props}
					>
						<HugeiconsIcon icon={LanguageSkillIcon} size={18} strokeWidth={1.8} />
					</Button>
				)}
			/>
			<DropdownMenuContent align="end" className="min-w-[9rem]">
				{options.map((option) => (
					<DropdownMenuItem
						key={option.id}
						onClick={() => setLocale(option.id)}
						className={locale === option.id ? "bg-accent/50 font-medium" : undefined}
					>
						{option.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
