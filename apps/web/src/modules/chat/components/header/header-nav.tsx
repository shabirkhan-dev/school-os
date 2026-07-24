import { Button } from "@school-os/ui/components/button";
import { cn } from "@/lib/utils";

import { headerTabs } from "@/modules/chat/components/header/header.data";
import { HeaderHugeIcon } from "@/modules/chat/components/header/huge-icon";

export function HeaderNav() {
	return (
		<nav className="top-nav" aria-label="Primary">
			{headerTabs.map(({ label, icon, active }) => (
				<Button
					variant="ghost"
					size="sm"
					className={cn("top-nav__item", active && "is-active")}
					key={label}
				>
					<HeaderHugeIcon icon={icon} />
					<span>{label}</span>
				</Button>
			))}
		</nav>
	);
}
