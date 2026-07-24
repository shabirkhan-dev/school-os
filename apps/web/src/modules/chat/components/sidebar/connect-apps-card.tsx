import { Add01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@school-os/ui/components/button";
import { cn } from "@/lib/utils";

import { AppBrandIcon, connectApps } from "@/modules/chat/components/brand-icons";
import { SidebarHugeIcon } from "@/modules/chat/components/sidebar/sidebar-icon";

export function ConnectAppsCard() {
	return (
		<div className="sidebar-card">
			<h2>Connect apps</h2>
			<p>External apps such as Figma, Github, Drive</p>
			<div className="mini-icons">
				{connectApps.map(({ id, label, brand }) => (
					<Button
						variant="outline"
						size="icon-xs"
						className="mini-icon"
						key={id}
						aria-label={label}
					>
						<AppBrandIcon brand={brand} size={11} />
					</Button>
				))}
				<Button
					variant="outline"
					size="icon-xs"
					className={cn("mini-icon", "mini-icon--add")}
					aria-label="Connect more apps"
				>
					<SidebarHugeIcon icon={Add01Icon} size={11} />
				</Button>
			</div>
		</div>
	);
}
