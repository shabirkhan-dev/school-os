import { Button } from "@school-os/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@school-os/ui/components/dialog";

import { setupSteps } from "@/modules/chat/components/welcome/welcome.data";
import { WelcomeHugeIcon } from "@/modules/chat/components/welcome/welcome-icon";

type WelcomeModalProps = {
	onClose: () => void;
};

export function WelcomeModal({ onClose }: WelcomeModalProps) {
	return (
		<Dialog open onOpenChange={(nextOpen) => !nextOpen && onClose()}>
			<DialogContent
				showCloseButton={false}
				className="welcome-modal gap-0 overflow-hidden border-white/80 bg-white p-0 text-neutral-900 sm:max-w-[508px]"
			>
				<section
					className="welcome-modal__preview relative h-[276px] overflow-hidden bg-[radial-gradient(ellipse_at_8%_78%,rgba(102,78,246,0.86),transparent_37%),radial-gradient(ellipse_at_45%_2%,rgba(255,255,255,0.94),transparent_27%),radial-gradient(ellipse_at_92%_18%,rgba(156,225,248,0.84),transparent_43%),linear-gradient(116deg,#7f86ff_0%,#e2cfff_46%,#79cbed_100%)]"
					aria-label="Workspace setup progress"
				>
					<div className="welcome-modal__setup-card absolute top-[43px] right-0 bottom-0 left-8 rounded-tl-[18px] border border-b-0 border-l border-black/4 bg-white px-3.5 pt-3.5 pb-[14px]">
						<div className="window-dots flex h-2.5 items-center gap-2" aria-hidden="true">
							<span className="window-dot window-dot--red size-2.5 rounded-full bg-[#ff5f57]" />
							<span className="window-dot window-dot--yellow size-2.5 rounded-full bg-[#ffbd2e]" />
							<span className="window-dot window-dot--green size-2.5 rounded-full bg-[#28c840]" />
						</div>
						<div className="welcome-modal__steps grid gap-[21px] mt-[26px] ml-[13px]">
							{setupSteps.map(({ label, icon }) => (
								<div
									className="setup-step flex items-center gap-2.5 text-sm text-neutral-500"
									key={label}
								>
									<WelcomeHugeIcon icon={icon} />
									<span>{label}</span>
								</div>
							))}
						</div>
					</div>
				</section>

				<DialogHeader className="welcome-modal__body border-t border-neutral-200 bg-white px-[30px] pt-[27px] pb-0">
					<DialogTitle id="welcome-modal-title" className="text-2xl font-[450] text-neutral-900">
						Welcome to Alpaca
					</DialogTitle>
					<DialogDescription className="mt-3 text-lg text-neutral-500">
						Your AI workspace is ready to build, automate, explore tools, and run intelligent
						workflows locally.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className="mx-0 mb-0 border-0 bg-transparent px-[30px] pt-0 pb-[31px]">
					<Button
						className="welcome-modal__action h-[42px] w-full rounded-full border-black/8 bg-neutral-800 text-white hover:bg-neutral-900"
						onClick={onClose}
					>
						Explore
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
