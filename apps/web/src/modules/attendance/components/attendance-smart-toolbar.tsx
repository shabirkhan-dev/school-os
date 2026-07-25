"use client";

import { CheckmarkCircle02Icon, QrCodeIcon, UserRemove01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { SearchInput } from "@school-os/ui/components/search-input";

type Props = {
	search: string;
	onSearchChange: (value: string) => void;
	scanMode: boolean;
	onScanModeChange: (enabled: boolean) => void;
	onMarkAllPresent: () => void;
	onMarkUnmarkedAbsent: () => void;
	onConfirmAllPresentSave?: () => void;
	confirmAllPending?: boolean;
	canMark: boolean;
};

export function AttendanceSmartToolbar({
	search,
	onSearchChange,
	scanMode,
	onScanModeChange,
	onMarkAllPresent,
	onMarkUnmarkedAbsent,
	onConfirmAllPresentSave,
	confirmAllPending = false,
	canMark,
}: Props) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<SearchInput
				value={search}
				onValueChange={onSearchChange}
				placeholder="Search by name or admission no."
				className="min-w-[220px] flex-1"
				aria-label="Search roster"
			/>
			{canMark ? (
				<>
					{onConfirmAllPresentSave ? (
						<Button
							type="button"
							size="sm"
							className="gap-1.5"
							onClick={onConfirmAllPresentSave}
							disabled={confirmAllPending}
						>
							<HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} strokeWidth={2} />
							{confirmAllPending ? "Saving…" : "Confirm & save all present"}
						</Button>
					) : null}
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-1.5"
						onClick={onMarkAllPresent}
					>
						<HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} strokeWidth={2} />
						All present
					</Button>
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-1.5"
						onClick={onMarkUnmarkedAbsent}
					>
						<HugeiconsIcon icon={UserRemove01Icon} size={15} strokeWidth={2} />
						Unmarked → absent
					</Button>
					<Button
						type="button"
						variant={scanMode ? "default" : "outline"}
						size="sm"
						className="gap-1.5"
						onClick={() => onScanModeChange(!scanMode)}
					>
						<HugeiconsIcon icon={QrCodeIcon} size={15} strokeWidth={2} />
						{scanMode ? "Scan on" : "QR / code scan"}
					</Button>
				</>
			) : null}
		</div>
	);
}
