import { Button } from "@school-os/ui/components/button";

type RecentSectionProps = {
	items: string[];
};

export function RecentSection({ items }: RecentSectionProps) {
	return (
		<div className="sidebar__section">
			<p className="sidebar__label">Recents</p>
			{items.map((recent) => (
				<Button variant="ghost" className="recent-item justify-start" key={recent}>
					{recent}
				</Button>
			))}
		</div>
	);
}
