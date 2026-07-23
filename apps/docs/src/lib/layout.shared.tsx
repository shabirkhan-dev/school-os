import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import Link from "next/link";
import { appName, gitConfig } from "./shared";

export function baseOptions(): BaseLayoutProps {
	return {
		nav: {
			title: (
				<Link href="/docs" className="flex items-center gap-2 font-semibold">
					<Image
						src="/brand/school-os-mark.svg"
						alt=""
						width={28}
						height={28}
						className="size-7 rounded-lg"
						priority
					/>
					{appName}
				</Link>
			),
		},
		githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
	};
}
