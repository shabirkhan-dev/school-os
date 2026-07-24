"use client";

import { Logout01Icon, ShieldIcon, UserCircle02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@school-os/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@school-os/ui/components/dropdown-menu";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";
import { userInitials } from "@/lib/user-display";
import { HeaderHugeIcon } from "@/modules/chat/components/header/huge-icon";

export function HeaderUserMenu() {
	const router = useRouter();
	const { user, logout } = useAuth();

	if (!user) {
		return null;
	}

	const initials = userInitials(user.username);

	async function handleLogout() {
		await logout();
		router.push("/login");
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="ghost" size="icon" className="avatar-button" />}
				aria-label="Account menu"
			>
				<span className="avatar-button__initials" aria-hidden="true">
					{initials}
				</span>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="account-menu__panel w-62">
				<div className="account-menu__identity flex items-center gap-2.5 px-2 py-1.5">
					<span
						className="account-menu__avatar grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white bg-[radial-gradient(circle_at_50%_25%,#ffffff_0_18%,transparent_19%),radial-gradient(circle_at_50%_110%,#8b5cf6_0_42%,transparent_43%),linear-gradient(135deg,#d8ccff,#7846ff)]"
						aria-hidden="true"
					>
						{initials}
					</span>
					<div className="account-menu__meta min-w-0">
						<p className="account-menu__name m-0 truncate text-sm font-semibold">{user.username}</p>
						<p className="account-menu__email m-0 truncate text-xs text-muted-foreground">
							{user.email}
						</p>
					</div>
				</div>

				<DropdownMenuSeparator className="account-menu__divider" />

				<DropdownMenuGroup>
					<DropdownMenuItem
						render={<Link href="/chat/account/profile" />}
						className="account-menu__item"
					>
						<HeaderHugeIcon icon={UserCircle02Icon} />
						<span>Profile</span>
					</DropdownMenuItem>
					<DropdownMenuItem
						render={<Link href="/chat/account/security" />}
						className="account-menu__item"
					>
						<HeaderHugeIcon icon={ShieldIcon} />
						<span>Security</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className="account-menu__divider" />

				<DropdownMenuItem
					variant="destructive"
					className="account-menu__item text-destructive focus:text-destructive"
					onClick={() => void handleLogout()}
				>
					<HeaderHugeIcon icon={Logout01Icon} />
					<span>Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
