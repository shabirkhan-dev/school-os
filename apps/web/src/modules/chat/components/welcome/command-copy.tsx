import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@school-os/ui/components/button";
import { useEffect, useState } from "react";

import { WelcomeHugeIcon } from "@/modules/chat/components/welcome/welcome-icon";
import { cn } from "@/modules/chat/lib/utils";

type CommandCopyProps = {
	command: string;
	compact?: boolean;
};

export function CommandCopy({ command, compact = false }: CommandCopyProps) {
	const [isCopied, setIsCopied] = useState(false);

	useEffect(() => {
		if (!isCopied) {
			return;
		}

		const timeoutId = window.setTimeout(() => setIsCopied(false), 1600);

		return () => window.clearTimeout(timeoutId);
	}, [isCopied]);

	const copyCommand = async () => {
		await navigator.clipboard.writeText(command);
		setIsCopied(true);
	};

	return (
		<div className={cn("command-copy", compact && "command-copy--compact")}>
			<code>{command}</code>
			<Button
				variant="ghost"
				size="icon"
				className="command-copy__button"
				aria-label={isCopied ? "Command copied" : "Copy command"}
				title={isCopied ? "Copied" : "Copy command"}
				onClick={copyCommand}
			>
				<WelcomeHugeIcon icon={isCopied ? Tick02Icon : Copy01Icon} />
			</Button>
		</div>
	);
}
