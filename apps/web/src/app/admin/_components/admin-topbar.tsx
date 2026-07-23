"use client";

import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@school-os/ui/components/sheet";
import { TooltipProvider } from "@school-os/ui/components/tooltip";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./admin-sidebar";
import { BreadcrumbTrail, type Crumb } from "./topbar/breadcrumb-trail";
import { GlobalSearch } from "./topbar/global-search";
import { TopbarActions } from "./topbar/topbar-actions";

type Props = {
	crumbs?: Crumb[];
	className?: string;
};

const defaultCrumbs: Crumb[] = [{ label: "Dashboard", href: "/admin" }, { label: "Overview" }];

function crumbsForPath(pathname: string): Crumb[] {
	if (pathname.startsWith("/admin/members")) {
		return [{ label: "Dashboard", href: "/admin" }, { label: "Members" }];
	}
	if (pathname.startsWith("/admin/account/profile")) {
		return [
			{ label: "Dashboard", href: "/admin" },
			{ label: "Account", href: "/admin/account/profile" },
			{ label: "Profile" },
		];
	}
	if (pathname.startsWith("/admin/account/security")) {
		return [
			{ label: "Dashboard", href: "/admin" },
			{ label: "Account", href: "/admin/account/profile" },
			{ label: "Security" },
		];
	}
	if (pathname.startsWith("/admin/timetable")) {
		return [{ label: "Dashboard", href: "/admin" }, { label: "Timetable" }];
	}
	return defaultCrumbs;
}

export function AdminTopbar({ crumbs, className }: Props) {
	const pathname = usePathname();
	const items = crumbs ?? crumbsForPath(pathname);
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	return (
		<TooltipProvider delay={120}>
			<header
				className={cn(
					"sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-dashboard-border-subtle border-b bg-dashboard-topbar-bg/80 px-3 backdrop-blur-md sm:gap-4 sm:px-5",
					className,
				)}
			>
				<Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
					<SheetTrigger
						render={(props) => (
							<button
								type="button"
								{...props}
								aria-label="Open navigation"
								className="flex size-9 shrink-0 items-center justify-center rounded-lg text-dashboard-text-muted transition-colors hover:bg-dashboard-hover hover:text-dashboard-text-primary lg:hidden"
							>
								<HugeiconsIcon icon={Menu01Icon} size={19} strokeWidth={1.9} />
							</button>
						)}
					/>
					<SheetContent
						side="left"
						className="w-[min(88vw,320px)] max-w-none gap-0 border-dashboard-border-subtle bg-dashboard-sidebar-bg p-0 text-dashboard-text-primary"
					>
						<SheetTitle className="sr-only">Admin navigation</SheetTitle>
						<AdminSidebar mobile onNavigate={() => setMobileNavOpen(false)} />
					</SheetContent>
				</Sheet>

				<BreadcrumbTrail items={items} className="min-w-0 flex-1 sm:flex-none" />

				<div className="hidden flex-1 justify-center md:flex">
					<GlobalSearch className="w-full max-w-[420px]" />
				</div>

				<TopbarActions className="ml-auto shrink-0" />
			</header>
		</TooltipProvider>
	);
}
