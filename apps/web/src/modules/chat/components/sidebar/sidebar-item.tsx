import { Folder01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@school-os/ui/components/button";
import { cn } from "@/lib/utils";
import type { SidebarIcon } from "@/modules/chat/components/sidebar/sidebar.types";
import { SidebarHugeIcon } from "@/modules/chat/components/sidebar/sidebar-icon";

type SidebarItemProps = {
	label: string;
	icon?: SidebarIcon;
	active?: boolean;
	badge?: string;
	onSelect?: (label: string) => void;
};

export function SidebarItem({
	label,
	icon = Folder01Icon,
	active,
	badge,
	onSelect,
}: SidebarItemProps) {
	return (
		<Button
			variant="ghost"
			aria-current={active ? "page" : undefined}
			className={cn("side-item justify-start", active && "is-active")}
			onClick={() => onSelect?.(label)}
		>
			<SidebarHugeIcon icon={icon} />
			<span className="side-item__label">{label}</span>
			{badge ? <span className="new-badge">{badge}</span> : null}
		</Button>
	);
}
