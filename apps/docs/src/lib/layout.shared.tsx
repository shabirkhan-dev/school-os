import { SchoolOsBrand } from "@school-os/ui";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Link from "next/link";
import { gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<Link
					href="/docs"
					className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
				>
					<SchoolOsBrand name="School OS Docs" nameClassName="text-base" />
				</Link>
			),
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
