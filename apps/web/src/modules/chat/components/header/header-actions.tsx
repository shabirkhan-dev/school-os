import { Message01Icon, Notification03Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";

import { HeaderUserMenu } from "@/modules/chat/components/header/header-user-menu";
import { HeaderHugeIcon } from "@/modules/chat/components/header/huge-icon";
import { ThemeToggle } from "@/modules/chat/components/header/theme-toggle";

function HeaderIconButton({ label, icon }: { label: string; icon: IconSvgElement }) {
	return (
		<Button variant="ghost" size="icon" className="icon-button" aria-label={label}>
			<HeaderHugeIcon icon={icon} />
		</Button>
	);
}

export function HeaderActions() {
	return (
		<div className="top-actions">
			<ThemeToggle />
			<HeaderIconButton label="Notifications" icon={Notification03Icon} />
			<HeaderIconButton label="Messages" icon={Message01Icon} />
			<Button variant="ghost" size="sm" className="invite-button">
				<HeaderHugeIcon icon={UserAdd01Icon} />
				<span>Invite</span>
			</Button>
			<HeaderUserMenu />
		</div>
	);
}
