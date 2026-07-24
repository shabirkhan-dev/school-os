import {
	AiNetworkIcon,
	ArrowDown01Icon,
	ArrowUp02Icon,
	CrownIcon,
	Loading03Icon,
	Mic01Icon,
	PlusSignIcon,
	SentIcon,
	SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@school-os/ui/components/button";
import { Textarea } from "@school-os/ui/components/textarea";
import { type FormEvent, type KeyboardEvent, useState } from "react";

import { ChatHugeIcon } from "@/modules/chat/components/chat/chat-icon";

export type ChatComposerProps = {
	value?: string;
	onChange?: (value: string) => void;
	onSubmitPrompt?: (value: string) => void;
	disabled?: boolean;
	busy?: boolean;
	placeholder?: string;
	modelLabel?: string;
	showUpgradeRail?: boolean;
};

export function ChatComposer({
	value,
	onChange,
	onSubmitPrompt,
	disabled = false,
	busy = false,
	placeholder = "Ask anything...",
	modelLabel = "Opus 4.7",
	showUpgradeRail = true,
}: ChatComposerProps = {}) {
	const [uncontrolledPrompt, setUncontrolledPrompt] = useState("");
	const isControlled = value !== undefined;
	const prompt = isControlled ? value : uncontrolledPrompt;
	const canSubmit = prompt.trim().length > 0 && !disabled && !busy;

	const setPrompt = (next: string) => {
		if (isControlled) {
			onChange?.(next);
			return;
		}
		setUncontrolledPrompt(next);
	};

	const submitPrompt = () => {
		if (!canSubmit) {
			return;
		}

		const next = prompt.trim();
		onSubmitPrompt?.(next);
		if (!isControlled) {
			setUncontrolledPrompt("");
		}
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		submitPrompt();
	};

	const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			submitPrompt();
		}
	};

	return (
		<form className="chat-composer" onSubmit={handleSubmit}>
			<div className="chat-composer__panel">
				<Textarea
					aria-label="Message"
					placeholder={placeholder}
					rows={3}
					value={prompt}
					disabled={disabled || busy}
					onChange={(event) => setPrompt(event.target.value)}
					onKeyDown={handleKeyDown}
				/>

				<div className="chat-composer__toolbar">
					<div className="chat-composer__tools">
						<Button
							variant="outline"
							size="icon"
							className="chat-tool-button"
							aria-label="Add attachment"
						>
							<ChatHugeIcon icon={PlusSignIcon} />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="chat-tool-button"
							aria-label="Choose tools"
						>
							<ChatHugeIcon icon={AiNetworkIcon} />
						</Button>
						<Button variant="ghost" size="sm" className="chat-super-computer">
							<ChatHugeIcon icon={SentIcon} />
							<span>Super Computer</span>
							<span className="chat-new-badge">New</span>
						</Button>
					</div>

					<div className="chat-composer__actions">
						<Button variant="ghost" size="sm" className="chat-model-button">
							<ChatHugeIcon icon={SparklesIcon} />
							<span>{modelLabel}</span>
							<ChatHugeIcon icon={ArrowDown01Icon} size={14} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="chat-mic-button"
							aria-label="Use microphone"
						>
							<ChatHugeIcon icon={Mic01Icon} />
						</Button>
						<Button
							size="icon"
							className="chat-send-button"
							type="submit"
							aria-label="Send message"
							disabled={!canSubmit}
						>
							<ChatHugeIcon
								icon={busy ? Loading03Icon : ArrowUp02Icon}
								strokeWidth={1.8}
								className={busy ? "chat-send-button__spin" : undefined}
							/>
						</Button>
					</div>
				</div>
			</div>

			{showUpgradeRail ? (
				<div className="chat-upgrade-rail">
					<span className="chat-upgrade-rail__label">
						<ChatHugeIcon icon={CrownIcon} />
						<span>Upgrade to PRO</span>
					</span>
					<Button size="xs">Upgrade</Button>
				</div>
			) : null}
		</form>
	);
}
