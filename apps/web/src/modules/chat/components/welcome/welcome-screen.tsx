import { AiBrain01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@school-os/ui/components/button";
import { useState } from "react";

import { CommandCopy } from "@/modules/chat/components/welcome/command-copy";
import { SetupCard } from "@/modules/chat/components/welcome/setup-card";
import {
	cloudReadyItems,
	installCommand,
	launchCommand,
} from "@/modules/chat/components/welcome/welcome.data";
import { WelcomeHugeIcon } from "@/modules/chat/components/welcome/welcome-icon";
import { WelcomeModal } from "@/modules/chat/components/welcome/welcome-modal";

export function WelcomeScreen() {
	const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);

	return (
		<main className="welcome-screen">
			<section className="welcome-screen__inner">
				<div className="dot-field welcome-screen__dots" />

				<div className="welcome-hero">
					<Button
						variant="ghost"
						size="icon"
						className="welcome-hero__icon"
						aria-label="Open Alpaca welcome"
						onClick={() => setIsWelcomeModalOpen(true)}
					>
						<WelcomeHugeIcon icon={AiBrain01Icon} size={34} strokeWidth={1.35} />
					</Button>
					<h1>Build AI apps locally</h1>
					<p>Run powerful open models in minutes.</p>
					<CommandCopy command={installCommand} />
				</div>

				<div className="welcome-divider" />

				<section className="launch-section" aria-label="Launch workspace">
					<SetupCard />
					<div className="launch-copy">
						<h2>Launch your workspace</h2>
						<p>Start coding, researching, and automating with OpenClaw and Alpaca.</p>
						<CommandCopy command={launchCommand} compact />
					</div>
				</section>

				<section className="cloud-ready">
					<h2>Local first. Cloud ready.</h2>
					<p>Scale from your laptop to larger hosted models whenever you need more power.</p>
					<ul>
						{cloudReadyItems.map((item) => (
							<li key={item}>
								<WelcomeHugeIcon icon={Tick02Icon} />
								<span>{item}</span>
							</li>
						))}
					</ul>
				</section>
			</section>
			{isWelcomeModalOpen ? <WelcomeModal onClose={() => setIsWelcomeModalOpen(false)} /> : null}
		</main>
	);
}
