"use client";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@school-os/ui/components/dropdown-menu";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { userInitials } from "@/lib/user-display";
import type { User } from "@/modules/users/types/user.types";
import { springSnappy } from "../lib/motion";
import { cn } from "../lib/utils";

type LandingAuthActionsProps = {
	mobile?: boolean;
	onNavigate?: () => void;
};

export function LandingAuthActions({ mobile = false, onNavigate }: LandingAuthActionsProps) {
	const { user, loading, logout } = useAuth();
	const reduceMotion = useReducedMotion();

	if (loading) {
		return mobile ? (
			<div className="mt-3 flex flex-col gap-2.5 px-1.5 pt-1">
				<div className="h-12 animate-pulse rounded-full bg-muted" />
				<div className="h-12 animate-pulse rounded-full bg-muted/70" />
			</div>
		) : (
			<div className="hidden items-center gap-2 sm:flex" aria-hidden>
				<span className="h-8 w-14 animate-pulse rounded-full bg-muted" />
				<span className="h-8 w-24 animate-pulse rounded-full bg-muted/70" />
			</div>
		);
	}

	if (user) {
		return mobile ? (
			<MobileSignedIn user={user} onNavigate={onNavigate} logout={logout} />
		) : (
			<DesktopSignedIn user={user} logout={logout} reduceMotion={!!reduceMotion} />
		);
	}

	return mobile ? (
		<div className="mt-3 flex flex-col gap-2.5 px-1.5 pt-1">
			<Link
				href="/login"
				onClick={onNavigate}
				className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-4 text-center font-medium text-foreground text-sm transition-colors hover:bg-muted"
			>
				Sign in
			</Link>
			<Link
				href="/billing"
				onClick={onNavigate}
				className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-4 text-center font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
			>
				Start pilot
			</Link>
			<Link
				href="#deploy"
				onClick={onNavigate}
				className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-background px-4 text-center font-medium text-foreground text-sm transition-colors hover:bg-muted"
			>
				For developers
			</Link>
		</div>
	) : (
		<div className="flex items-center gap-2">
			<Link
				href="/login"
				className="hidden h-8 items-center justify-center rounded-full px-3 font-medium text-foreground/80 text-xs transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
			>
				Sign in
			</Link>
			<motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={springSnappy}>
				<Link
					href="/billing"
					className="hidden h-8 items-center justify-center rounded-full bg-primary px-3 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/90 sm:inline-flex"
				>
					Start pilot
				</Link>
			</motion.div>
		</div>
	);
}

function displayNameFor(user: User): string {
	return user.profile?.displayName?.trim() || user.username;
}

function DesktopSignedIn({
	user,
	logout,
	reduceMotion,
}: {
	user: User;
	logout: () => Promise<void>;
	reduceMotion: boolean;
}) {
	const router = useRouter();
	const name = displayNameFor(user);
	const initials = userInitials(name);

	const handleLogout = async () => {
		await logout();
		router.refresh();
	};

	return (
		<div className="flex items-center gap-2">
			<motion.div
				whileHover={reduceMotion ? undefined : { scale: 1.03 }}
				whileTap={reduceMotion ? undefined : { scale: 0.97 }}
				transition={springSnappy}
				className="hidden sm:block"
			>
				<Link
					href="/admin"
					className="inline-flex h-8 items-center justify-center rounded-full bg-primary px-3 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/90"
				>
					Dashboard
				</Link>
			</motion.div>

			<DropdownMenu>
				<DropdownMenuTrigger
					render={(props) => (
						<button
							type="button"
							{...props}
							aria-label="Account menu"
							className={cn(
								"inline-flex h-8 max-w-[11rem] items-center gap-2 rounded-full border border-border/60 bg-card px-1.5 pr-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-foreground/30",
							)}
						>
							<span className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full bg-foreground font-semibold text-[10px] text-background">
								{user.profile?.avatarUrl ? (
									<Image
										src={user.profile.avatarUrl}
										alt=""
										width={24}
										height={24}
										unoptimized
										className="size-full object-cover"
									/>
								) : (
									initials
								)}
							</span>
							<span className="hidden truncate font-medium text-foreground text-xs sm:inline">
								{name}
							</span>
						</button>
					)}
				/>
				<DropdownMenuContent align="end" sideOffset={8} className="min-w-48">
					<DropdownMenuGroup>
						<DropdownMenuLabel className="px-2 py-1.5">
							<p className="truncate font-medium text-foreground text-sm">{name}</p>
							<p className="truncate text-muted-foreground text-xs">{user.email}</p>
						</DropdownMenuLabel>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem render={<Link href="/admin" />} className="cursor-pointer">
						Dashboard
					</DropdownMenuItem>
					<DropdownMenuItem
						render={<Link href="/admin/account/profile" />}
						className="cursor-pointer"
					>
						Account
					</DropdownMenuItem>
					<DropdownMenuItem render={<Link href="/billing" />} className="cursor-pointer">
						Billing
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => void handleLogout()} className="cursor-pointer">
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

function MobileSignedIn({
	user,
	onNavigate,
	logout,
}: {
	user: User;
	onNavigate?: () => void;
	logout: () => Promise<void>;
}) {
	const router = useRouter();
	const name = displayNameFor(user);
	const initials = userInitials(name);

	const handleLogout = async () => {
		onNavigate?.();
		await logout();
		router.refresh();
	};

	return (
		<div className="mt-3 flex flex-col gap-2.5 px-1.5 pt-1">
			<div className="flex items-center gap-3 rounded-2xl border border-border/50 bg-background px-3.5 py-3">
				<span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-foreground font-semibold text-background text-sm">
					{user.profile?.avatarUrl ? (
						<Image
							src={user.profile.avatarUrl}
							alt=""
							width={40}
							height={40}
							unoptimized
							className="size-full object-cover"
						/>
					) : (
						initials
					)}
				</span>
				<div className="min-w-0">
					<p className="truncate font-medium text-foreground text-sm">{name}</p>
					<p className="truncate text-muted-foreground text-xs">{user.email}</p>
				</div>
			</div>
			<Link
				href="/admin"
				onClick={onNavigate}
				className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-4 text-center font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
			>
				Open dashboard
			</Link>
			<Link
				href="/admin/account/profile"
				onClick={onNavigate}
				className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-4 text-center font-medium text-foreground text-sm transition-colors hover:bg-muted"
			>
				Account
			</Link>
			<Link
				href="/billing"
				onClick={onNavigate}
				className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-4 text-center font-medium text-foreground text-sm transition-colors hover:bg-muted"
			>
				Billing
			</Link>
			<button
				type="button"
				onClick={() => void handleLogout()}
				className="inline-flex h-11 items-center justify-center rounded-full px-4 text-center font-medium text-muted-foreground text-sm transition-colors hover:bg-muted hover:text-foreground"
			>
				Sign out
			</button>
		</div>
	);
}
