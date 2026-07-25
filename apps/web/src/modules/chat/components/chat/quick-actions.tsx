import { Button } from "@school-os/ui/components/button";

import { chatQuickActions } from "@/modules/chat/components/chat/chat.data";
import { ChatHugeIcon } from "@/modules/chat/components/chat/chat-icon";

export function QuickActions() {
	return (
		<section className="chat-quick-actions" aria-label="Suggested actions">
			{chatQuickActions.map(({ label, description, icon }) => (
				<Button variant="outline" className="chat-quick-card" key={label}>
					<ChatHugeIcon icon={icon} size={18} />
					<span className="chat-quick-card__label">{label}</span>
					<span className="chat-quick-card__description">{description}</span>
				</Button>
			))}
		</section>
	);
}
