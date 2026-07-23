"use client";

import {
	CheckmarkCircle02Icon,
	QrCodeIcon,
	RefreshIcon,
	UserRemove01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { Input } from "@school-os/ui/components/input";
import { SearchInput } from "@school-os/ui/components/search-input";
import { cn } from "@/lib/utils";

type Props = {
	search: string;
	onSearchChange: (value: string) => void;
	scanMode: boolean;
	onScanModeChange: (enabled: boolean) => void;
	scanValue: string;
	onScanValueChange: (value: string) => void;
	onScanSubmit: () => void;
	onMarkAllPresent: () => void;
	onMarkUnmarkedAbsent: () => void;
	canMark: boolean;
	lastScanMessage: string | null;
};

export function AttendanceSmartToolbar({
	search,
	onSearchChange,
	scanMode,
	onScanModeChange,
	scanValue,
	onScanValueChange,
	onScanSubmit,
	onMarkAllPresent,
	onMarkUnmarkedAbsent,
	canMark,
	lastScanMessage,
}: Props) {
	return (
		<div className="space-y-3">
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

			{scanMode && canMark ? (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						onScanSubmit();
					}}
					className={cn(
						"rounded-[14px] border border-dashed border-dashboard-accent/40 bg-dashboard-accent-soft/40 p-3",
					)}
				>
					<p className="mb-2 font-medium text-[12px] text-dashboard-text-primary">
						Batch scan — enter or paste student admission number
					</p>
					<div className="flex flex-wrap gap-2">
						<Input
							value={scanValue}
							onChange={(event) => onScanValueChange(event.target.value)}
							placeholder="Scan QR or type admission no."
							className="min-w-[200px] flex-1 font-mono text-[13px]"
							autoFocus
						/>
						<Button type="submit" size="sm" className="gap-1.5">
							<HugeiconsIcon icon={RefreshIcon} size={15} strokeWidth={2} />
							Mark present
						</Button>
					</div>
					{lastScanMessage ? (
						<p className="mt-2 text-[12px] text-dashboard-text-secondary">{lastScanMessage}</p>
					) : (
						<p className="mt-2 text-[11px] text-dashboard-text-muted">
							Each successful scan marks the student present. Unknown codes show an error here.
						</p>
					)}
				</form>
			) : null}
		</div>
	);
}
