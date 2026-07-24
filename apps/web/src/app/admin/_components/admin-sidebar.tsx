"use client";

import {
	Logout01Icon,
	SecurityIcon,
	SidebarLeftIcon,
	Tick02Icon,
	UnfoldMoreIcon,
	UserCircle02Icon,
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";
import { useTenantContext, useWorkspaceSwitcherPolicy } from "@/modules/tenants";
import { useSessionStore } from "@/store";
import { AdminNavigationMenu } from "./admin-navigation-menu";

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

export function AdminSidebar({ className, mobile = false, onNavigate }: AdminSidebarProps) {
	const router = useRouter();
	const { user, logout } = useAuth();
	const { activeTenant, activeCampus, campuses, setActiveCampusId, setActiveTenantId } =
		useTenantContext();
	const tenants = useSessionStore((state) => state.tenants);
	const workspacePolicy = useWorkspaceSwitcherPolicy();
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
	const workspaceTitle = !workspacePolicy.allowCampusSwitch
		? workspacePolicy.workspaceSubtitle.includes("children")
			? tenantLabel
			: (school?.name ?? tenantLabel)
		: (school?.name ?? "Add a campus");
	const workspaceHint = !workspacePolicy.allowCampusSwitch
		? workspacePolicy.workspaceSubtitle
		: tenantLabel;
	const canOpenWorkspaceMenu =
		workspacePolicy.allowCampusSwitch || workspacePolicy.allowOrganizationSwitch;
	const width = mobile ? "w-full" : isCollapsed ? "w-[76px]" : "w-[260px]";
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
					{canOpenWorkspaceMenu ? (
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
														{workspaceHint}
													</div>
													<div className="truncate font-semibold text-[13px] text-dashboard-text-secondary leading-tight">
														{workspaceTitle}
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
								{workspacePolicy.allowOrganizationSwitch && tenants.length > 1 ? (
									<>
										<DropdownMenuGroup>
											<DropdownMenuLabel className="text-[10.5px] text-dashboard-text-dim uppercase">
												Organizations
											</DropdownMenuLabel>
										</DropdownMenuGroup>
										{tenants.map((tenant) => (
											<DropdownMenuItem
												key={tenant.id}
												onClick={() => setActiveTenantId(tenant.id)}
												className="gap-3 focus:bg-dashboard-hover-strong"
											>
												<div className="truncate font-medium text-[13px]">{tenant.name}</div>
												{tenant.id === activeTenant?.id ? (
													<HugeiconsIcon
														icon={Tick02Icon}
														size={16}
														className="ms-auto text-dashboard-accent"
													/>
												) : null}
											</DropdownMenuItem>
										))}
										<DropdownMenuSeparator className="bg-dashboard-border" />
									</>
								) : null}
								{workspacePolicy.allowCampusSwitch ? (
									<>
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
												<div className="text-[13px] text-dashboard-text-muted">
													Add your first campus
												</div>
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
									</>
								) : null}
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<div
							className={cn(
								"flex w-full items-center gap-3 rounded-lg bg-dashboard-surface px-2 py-2",
								isCollapsed && "justify-center px-1",
							)}
						>
							<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
								<span className="font-bold text-[15px] leading-none">
									{school?.mark ?? tenantLabel.charAt(0).toUpperCase()}
								</span>
							</div>
							{!isCollapsed && (
								<div className="min-w-0 flex-1">
									<div className="text-[11px] text-dashboard-text-dim leading-tight">
										{workspaceHint}
									</div>
									<div className="truncate font-semibold text-[13px] text-dashboard-text-secondary leading-tight">
										{workspaceTitle}
									</div>
								</div>
							)}
						</div>
					)}
				</div>

				{/* Nav */}
				<nav
					className={cn(
						"min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4",
						"[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-dashboard-border [&::-webkit-scrollbar-track]:bg-transparent",
					)}
				>
					<AdminNavigationMenu isCollapsed={isCollapsed} mobile={mobile} onNavigate={onNavigate} />
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
