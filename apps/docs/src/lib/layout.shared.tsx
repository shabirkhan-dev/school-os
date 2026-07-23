import { SchoolOsLogo } from "@school-os/ui";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Link from "next/link";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<Link href="/docs" className="flex items-center gap-2 font-semibold">
					<SchoolOsLogo className="h-6" />
					<span className="text-fd-muted-foreground font-medium text-sm">Docs</span>
				</Link>
			),
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
