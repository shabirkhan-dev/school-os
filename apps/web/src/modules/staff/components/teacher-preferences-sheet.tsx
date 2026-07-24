"use client";

import { Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { Checkbox } from "@school-os/ui/components/checkbox";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { SelectField } from "@school-os/ui/components/select-field";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@school-os/ui/components/sheet";
import { useEffect, useState } from "react";
import {
	readTeacherOnboarding,
	type TeacherNotificationPref,
	type TeacherOnboardingPrefs,
	type TeacherPlanStyle,
	writeTeacherOnboarding,
} from "../lib/teacher-onboarding.storage";

const planOptions = [
	{ label: "Brief — headlines only", value: "brief" },
	{ label: "Detailed — full class context", value: "detailed" },
	{ label: "Resources — links & materials first", value: "resources" },
];

const notificationOptions = [
	{ label: "Morning digest only", value: "digest" },
	{ label: "Important alerts", value: "important" },
	{ label: "Everything (not recommended)", value: "all" },
];

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSaved?: (prefs: TeacherOnboardingPrefs) => void;
};

export function TeacherPreferencesSheet({ open, onOpenChange, onSaved }: Props) {
	const [planStyle, setPlanStyle] = useState<TeacherPlanStyle>("brief");
	const [notifications, setNotifications] = useState<TeacherNotificationPref>("digest");
	const [quietHours, setQuietHours] = useState(true);

	useEffect(() => {
		if (!open) return;
		const existing = readTeacherOnboarding();
		if (!existing) return;
		setPlanStyle(existing.planStyle);
		setNotifications(existing.notifications);
		setQuietHours(existing.quietHours);
	}, [open]);

	function handleSave() {
		const prefs: TeacherOnboardingPrefs = {
			completedAt: readTeacherOnboarding()?.completedAt ?? new Date().toISOString(),
			planStyle,
			notifications,
			quietHours,
		};
		writeTeacherOnboarding(prefs);
		onSaved?.(prefs);
		onOpenChange(false);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-md">
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<HugeiconsIcon icon={Settings02Icon} strokeWidth={2} className="size-5" />
						Teacher preferences
					</SheetTitle>
					<SheetDescription>
						Stored on this device until org-wide settings ship (Phase 2). Affects home copy and
						quiet hours badge.
					</SheetDescription>
				</SheetHeader>

				<FieldGroup className="space-y-4 px-4 py-4">
					<Field>
						<FieldLabel>Home plan style</FieldLabel>
						<SelectField
							items={planOptions}
							value={planStyle}
							onValueChange={(value) => setPlanStyle(value as TeacherPlanStyle)}
						/>
					</Field>
					<Field>
						<FieldLabel>Notifications (when enabled)</FieldLabel>
						<SelectField
							items={notificationOptions}
							value={notifications}
							onValueChange={(value) => setNotifications(value as TeacherNotificationPref)}
						/>
					</Field>
					<div className="flex items-center justify-between gap-3 rounded-lg border p-3">
						<div>
							<p className="font-medium text-[13px]">Quiet hours badge</p>
							<p className="text-[12px] text-muted-foreground">
								After 8 PM, defer non-urgent nudges on your home screen
							</p>
						</div>
						<Checkbox
							checked={quietHours}
							onCheckedChange={(checked) => setQuietHours(checked === true)}
							aria-label="Enable quiet hours badge"
						/>
					</div>
				</FieldGroup>

				<SheetFooter className="border-t px-4 py-3">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save preferences</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
