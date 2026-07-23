"use client";

import {
	BubbleChatIcon,
	Building03Icon,
	Calendar03Icon,
	ClipboardIcon,
	DashboardSquare01Icon,
	File01Icon,
	HelpCircleIcon,
	Invoice01Icon,
	Logout01Icon,
	Megaphone01Icon,
	Mortarboard01Icon,
	PuzzleIcon,
	SecurityIcon,
	Settings02Icon,
	SidebarLeftIcon,
	StudentIcon,
	TeacherIcon,
	Tick02Icon,
	UnfoldMoreIcon,
	UserAdd01Icon,
	UserCircle02Icon,
	UserMultiple02Icon,
	UserSettings01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@school-os/ui/components/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@school-os/ui/components/tooltip";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentProps, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { useTenantContext } from "@/modules/tenants";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];
type NavItem = { id: string; label: string; icon: IconType; href?: string };
type NavSection = { heading: string; items: NavItem[] };

const sections: NavSection[] = [
	{
		heading: "Main Menu",
		items: [
			{ id: "dashboard", label: "Dashboard", icon: DashboardSquare01Icon, href: "/admin" },
			{ id: "ai-assist", label: "AI Assist", icon: BubbleChatIcon, href: "/admin/ai" },
			{ id: "attendance", label: "Attendance", icon: ClipboardIcon, href: "/admin/attendance" },
			{ id: "timetable", label: "Timetable", icon: Calendar03Icon },
			{ id: "exams", label: "Exams", icon: File01Icon },
			{ id: "announcements", label: "Announcements", icon: Megaphone01Icon },
		],
	},
	{
		heading: "People",
		items: [
			{ id: "students", label: "Students", icon: StudentIcon, href: "/admin/students" },
			{ id: "teachers", label: "Teachers", icon: TeacherIcon },
			{ id: "guardians", label: "Guardians", icon: UserMultiple02Icon },
		],
	},
	{
		heading: "Management",
		items: [
			{ id: "admissions", label: "Admissions", icon: UserAdd01Icon },
			{ id: "fees", label: "Fees & Invoices", icon: Invoice01Icon },
			{ id: "academics", label: "Academics", icon: Mortarboard01Icon, href: "/admin/academics" },
			{ id: "roles", label: "Roles & Permissions", icon: UserSettings01Icon },
			{ id: "integrations", label: "Integrations", icon: PuzzleIcon },
		],
	},
	{
		heading: "Settings",
		items: [
			{ id: "help", label: "Help Center", icon: HelpCircleIcon },
			{ id: "system", label: "System Settings", icon: Settings02Icon },
			{
				id: "organization",
				label: "Organization",
				icon: Building03Icon,
				href: "/admin/organization",
			},
			{
				id: "account-profile",
				label: "Profile",
				icon: UserCircle02Icon,
				href: "/admin/account/profile",
			},
			{
				id: "account-security",
				label: "Account Security",
				icon: SecurityIcon,
				href: "/admin/account/security",
			},
		],
	},
];

type School = { id: string; name: string; kind: string; mark: string };

function campusMark(name: string, code: string): string {
	const fromCode = code.replace(/[^A-Za-z0-9]/g, "").slice(0, 2);
	if (fromCode) return fromCode.toUpperCase();
	return name.trim().charAt(0).toUpperCase() || "S";
}

type AdminSidebarProps = {
	className?: string;
	mobile?: boolean;
	onNavigate?: () => void;
};

function activeNavId(pathname: string): string {
	if (pathname.startsWith("/admin/tenants/") || pathname.startsWith("/admin/organization")) {
		return "organization";
	}
	if (pathname.startsWith("/admin/account/profile")) {
		return "account-profile";
	}
	if (pathname.startsWith("/admin/account/security")) {
		return "account-security";
	}
	if (pathname.startsWith("/admin/ai")) {
		return "ai-assist";
	}
	if (pathname === "/admin" || pathname === "/admin/") {
		return "dashboard";
	}
	return "dashboard";
}

export function AdminSidebar({ className, mobile = false, onNavigate }: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { user, logout } = useAuth();
	const { activeTenant, activeCampus, campuses, setActiveCampusId, setActiveTenantId } =
		useTenantContext();
	const [collapsed, setCollapsed] = useState(false);

	const schools: School[] = campuses.map((campus) => ({
		id: campus.id,
		name: campus.name,
		kind: campus.code,
		mark: campusMark(campus.name, campus.code),
	}));
	const schoolId = activeCampus?.id ?? schools[0]?.id ?? "";
	const school = schools.find((s) => s.id === schoolId) ?? schools[0];
	const tenantLabel = activeTenant?.name ?? "Organization";
	const isCollapsed = !mobile && collapsed;
	const width = mobile ? "w-full" : isCollapsed ? "w-[76px]" : "w-[260px]";
	const activeId = activeNavId(pathname);
	const displayName = user?.username ?? "Account";
	const displayEmail = user?.email ?? "";
	const initials = userInitials(displayName);

	async function handleLogout() {
		await logout();
		router.push("/login");
	}

	return (
		<TooltipProvider delay={120}>
			<aside
				className={cn(
					"group/sidebar relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-dashboard-border-subtle border-r bg-dashboard-sidebar-bg transition-[width] duration-200 ease-out",
					width,
					className,
				)}
			>
				{/* Floating collapse toggle on the right edge */}
				{!mobile && (
					<Tooltip>
						<TooltipTrigger
							render={(props) => (
								<button
									type="button"
									{...props}
									onClick={() => setCollapsed((v) => !v)}
									aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
									className={cn(
										"absolute top-6 right-0 z-20 flex size-6 translate-x-1/2 items-center justify-center rounded-full border border-dashboard-border-strong bg-dashboard-surface-elevated text-dashboard-text-muted opacity-0 transition-all duration-150 group-hover/sidebar:opacity-100 hover:border-dashboard-border-focus hover:bg-dashboard-surface-strong hover:text-dashboard-text-primary focus-visible:opacity-100 active:scale-90",
									)}
								>
									<HugeiconsIcon
										icon={SidebarLeftIcon}
										size={13}
										strokeWidth={2}
										className={cn("transition-transform duration-200", collapsed && "rotate-180")}
									/>
								</button>
							)}
						/>
						<TooltipContent side="right">
							{collapsed ? "Expand sidebar" : "Collapse sidebar"}
						</TooltipContent>
					</Tooltip>
				)}

				{/* Workspace switcher */}
				<div className={cn("px-3 pt-4 pb-3", mobile && "pr-14")}>
					<DropdownMenu>
						<DropdownMenuTrigger
							render={(props) => (
								<button
									type="button"
									{...props}
									className={cn(
										"group/trigger flex w-full items-center gap-3 rounded-lg bg-dashboard-surface px-2 py-2 text-left transition-all hover:bg-dashboard-surface-hover active:scale-[0.985]",
										isCollapsed && "justify-center px-1",
									)}
								>
									<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
										<span className="font-bold text-[15px] leading-none">
											{school?.mark ?? tenantLabel.charAt(0).toUpperCase()}
										</span>
									</div>
									{!isCollapsed && (
										<>
											<div className="min-w-0 flex-1">
												<div className="text-[11px] text-dashboard-text-dim leading-tight">
													{tenantLabel}
												</div>
												<div className="truncate font-semibold text-[13px] text-dashboard-text-secondary leading-tight">
													{school?.name ?? "Add a campus"}
												</div>
											</div>
											<HugeiconsIcon
												icon={UnfoldMoreIcon}
												size={16}
												strokeWidth={1.8}
												className="text-dashboard-text-dim transition-colors group-hover/trigger:text-dashboard-text-secondary"
											/>
										</>
									)}
								</button>
							)}
						/>
						<DropdownMenuContent
							align="start"
							sideOffset={8}
							className="w-[244px] border-dashboard-border bg-dashboard-surface text-dashboard-text-secondary"
						>
							<DropdownMenuGroup>
								<DropdownMenuLabel className="text-[10.5px] text-dashboard-text-dim uppercase">
									Switch campus
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator className="bg-dashboard-border" />
							{schools.length === 0 ? (
								<DropdownMenuItem
									render={
										<Link
											href={
												activeTenant
													? `/admin/tenants/${activeTenant.id}/campuses`
													: "/admin/onboarding/tenant"
											}
											onClick={onNavigate}
										/>
									}
									className="gap-3 focus:bg-dashboard-hover-strong"
								>
									<div className="text-[13px] text-dashboard-text-muted">Add your first campus</div>
								</DropdownMenuItem>
							) : (
								schools.map((s) => {
									const selected = s.id === schoolId;
									return (
										<DropdownMenuItem
											key={s.id}
											onClick={() => {
												if (activeTenant) setActiveTenantId(activeTenant.id);
												setActiveCampusId(s.id);
											}}
											className="gap-3 focus:bg-dashboard-hover-strong"
										>
											<div className="flex size-8 items-center justify-center rounded-md bg-dashboard-accent-soft font-bold text-[13px] text-dashboard-accent">
												{s.mark}
											</div>
											<div className="min-w-0 flex-1">
												<div className="truncate font-medium text-[13px]">{s.name}</div>
												<div className="text-[11px] text-dashboard-text-dim">{s.kind}</div>
											</div>
											{selected ? (
												<HugeiconsIcon
													icon={Tick02Icon}
													size={16}
													className="text-dashboard-accent"
												/>
											) : null}
										</DropdownMenuItem>
									);
								})
							)}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Nav */}
				<nav
					className={cn(
						"min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4",
						"[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-dashboard-border [&::-webkit-scrollbar-track]:bg-transparent",
					)}
				>
					{sections.map((section, idx) => (
						<div
							key={section.heading}
							className={cn(idx > 0 && "mt-3 border-dashboard-border-subtle border-t pt-3")}
						>
							{!isCollapsed ? (
								<div className="px-2 pt-1 pb-1.5 font-medium text-[11px] text-dashboard-text-dim uppercase tracking-[0.06em]">
									{section.heading}
								</div>
							) : (
								idx > 0 && <div className="h-1" />
							)}
							<ul className="space-y-0.5">
								{section.items.map((item) => {
									const active = item.id === activeId;
									const className = cn(
										"group/item relative flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-[13px] transition-all duration-150",
										isCollapsed && "justify-center px-0",
										active
											? "bg-dashboard-accent-soft font-medium text-dashboard-accent hover:bg-dashboard-accent-soft"
											: "font-normal text-dashboard-text-muted hover:bg-dashboard-hover hover:text-dashboard-text-secondary active:scale-[0.985]",
									);
									const indicator = active ? (
										<span
											aria-hidden
											className="absolute top-1/2 left-0.5 h-4 w-0.5 -translate-y-1/2 rounded-full bg-dashboard-accent"
										/>
									) : null;
									const icon = (
										<HugeiconsIcon
											icon={item.icon}
											size={18}
											strokeWidth={active ? 2 : 1.7}
											className={cn(
												"shrink-0 transition-colors",
												active
													? "text-dashboard-accent"
													: "text-dashboard-text-dim group-hover/item:text-dashboard-text-secondary",
											)}
										/>
									);
									const label = !isCollapsed ? (
										<span className="truncate">{item.label}</span>
									) : null;
									const button = item.href ? (
										<Link href={item.href} className={className} onClick={onNavigate}>
											{indicator}
											{icon}
											{label}
										</Link>
									) : (
										<button type="button" className={className}>
											{indicator}
											{icon}
											{label}
										</button>
									);

									return (
										<li key={item.id}>
											{isCollapsed ? (
												<Tooltip>
													<TooltipTrigger render={() => button} />
													<TooltipContent side="right">{item.label}</TooltipContent>
												</Tooltip>
											) : (
												button
											)}
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>

				{/* User card */}
				<div className="border-dashboard-border-subtle border-t p-3">
					<DropdownMenu>
						<DropdownMenuTrigger
							render={(props) => (
								<button
									type="button"
									{...props}
									className={cn(
										"flex w-full items-center gap-3 rounded-lg bg-dashboard-surface-elevated px-2 py-2 text-left transition-all hover:bg-dashboard-surface-strong active:scale-[0.985]",
										isCollapsed && "justify-center px-1",
									)}
								>
									<div className="relative shrink-0">
										<div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-800 font-semibold text-[13px] text-dashboard-text-secondary ring-1 ring-dashboard-border-subtle">
											{initials}
										</div>
										<span className="absolute right-[-2px] bottom-[-2px] block size-2.5 rounded-full bg-emerald-500 ring-2 ring-dashboard-surface" />
									</div>
									{!isCollapsed && (
										<>
											<div className="min-w-0 flex-1">
												<div className="truncate font-semibold text-[13px] text-dashboard-text-secondary leading-tight">
													{displayName}
												</div>
												<div className="truncate text-[11px] text-dashboard-text-dim leading-tight">
													{displayEmail}
												</div>
											</div>
											<HugeiconsIcon
												icon={UnfoldMoreIcon}
												size={16}
												strokeWidth={1.8}
												className="text-dashboard-text-dim"
											/>
										</>
									)}
								</button>
							)}
						/>
						<DropdownMenuContent
							align="start"
							side="top"
							sideOffset={8}
							className="w-[244px] border-dashboard-border bg-dashboard-surface text-dashboard-text-secondary"
						>
							<DropdownMenuGroup>
								<DropdownMenuLabel className="font-normal">
									<div className="min-w-0">
										<div className="truncate font-medium text-[13px] text-dashboard-text-primary">
											{displayName}
										</div>
										<div className="truncate text-[11px] text-dashboard-text-dim">
											{displayEmail}
										</div>
									</div>
								</DropdownMenuLabel>
							</DropdownMenuGroup>
							<DropdownMenuSeparator className="bg-dashboard-border" />
							<DropdownMenuItem
								render={<Link href="/admin/account/profile" onClick={onNavigate} />}
								className="gap-2 focus:bg-dashboard-hover-strong"
							>
								<HugeiconsIcon icon={UserCircle02Icon} size={16} strokeWidth={1.8} />
								Profile
							</DropdownMenuItem>
							<DropdownMenuItem
								render={<Link href="/admin/account/security" onClick={onNavigate} />}
								className="gap-2 focus:bg-dashboard-hover-strong"
							>
								<HugeiconsIcon icon={SecurityIcon} size={16} strokeWidth={1.8} />
								Account security
							</DropdownMenuItem>
							<DropdownMenuSeparator className="bg-dashboard-border" />
							<DropdownMenuItem
								onClick={() => void handleLogout()}
								className="gap-2 focus:bg-dashboard-hover-strong"
							>
								<HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.8} />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</aside>
		</TooltipProvider>
	);
}
