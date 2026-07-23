"use client";

import { Notification03Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@school-os/ui/components/avatar";
import { Button } from "@school-os/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@school-os/ui/components/tooltip";
import Link from "next/link";
import type { ComponentProps } from "react";
import { ThemeToggleControl } from "@/components/motion/theme-toggle";
import { useAuth } from "@/context/auth-context";
import { userInitials } from "@/lib/user-display";
import { cn } from "@/lib/utils";

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];

type IconBtnProps = {
	icon: IconType;
	label: string;
	dot?: boolean;
	onClick?: () => void;
	className?: string;
};

function IconButton({ icon, label, dot, onClick, className }: IconBtnProps) {
	return (
		<Tooltip>
			<TooltipTrigger
				render={
					<Button
						variant="ghost"
						size="icon"
						aria-label={label}
						onClick={onClick}
						className={cn("relative text-muted-foreground", className)}
					/>
				}
			>
				<HugeiconsIcon icon={icon} strokeWidth={2} />
				{dot ? (
					<span
						aria-hidden
						className="absolute top-1.5 right-1.5 block size-2 rounded-full bg-primary ring-2 ring-background"
					/>
				) : null}
			</TooltipTrigger>
			<TooltipContent side="bottom">{label}</TooltipContent>
		</Tooltip>
	);
}

type Props = {
	avatarSrc?: string;
	avatarFallback?: string;
	unreadNotifications?: boolean;
	className?: string;
};

export function TopbarActions({
	avatarSrc,
	avatarFallback,
	unreadNotifications = true,
	className,
}: Props) {
	const { user } = useAuth();
	const initials = avatarFallback ?? (user ? userInitials(user.username) : "?");

	return (
		<div className={cn("flex items-center gap-0.5 sm:gap-1", className)}>
			<ThemeToggleControl />
			<IconButton icon={Notification03Icon} label="Notifications" dot={unreadNotifications} />
			<IconButton icon={PrinterIcon} label="Print" className="hidden sm:flex" />

			<Button
				variant="ghost"
				size="icon"
				className="ms-1 rounded-full"
				render={<Link href="/admin/account/profile" aria-label="Profile" />}
				nativeButton={false}
			>
				<Avatar className="size-9 ring-1 ring-border">
					{avatarSrc ? <AvatarImage src={avatarSrc} alt="Account" /> : null}
					<AvatarFallback className="bg-muted text-xs">{initials}</AvatarFallback>
				</Avatar>
			</Button>
		</div>
	);
}
