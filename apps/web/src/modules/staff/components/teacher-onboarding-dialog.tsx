"use client";

import { SparklesIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@school-os/ui/components/button";
import { Checkbox } from "@school-os/ui/components/checkbox";
import { Field, FieldLabel } from "@school-os/ui/components/field";
import { SelectField } from "@school-os/ui/components/select-field";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@school-os/ui/components/sheet";
import { useState } from "react";
import {
	type TeacherNotificationPref,
	type TeacherOnboardingPrefs,
	type TeacherPlanStyle,
	writeTeacherOnboarding,
} from "../lib/teacher-onboarding.storage";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	classCount: number;
	homeroomCount: number;
	onCompleted?: (prefs: TeacherOnboardingPrefs) => void;
};

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

export function TeacherOnboardingDialog({
	open,
	onOpenChange,
	classCount,
	homeroomCount,
	onCompleted,
}: Props) {
	const [step, setStep] = useState(0);
	const [planStyle, setPlanStyle] = useState<TeacherPlanStyle>("brief");
	const [notifications, setNotifications] = useState<TeacherNotificationPref>("digest");
	const [quietHours, setQuietHours] = useState(true);

	function finish() {
		const prefs: TeacherOnboardingPrefs = {
			completedAt: new Date().toISOString(),
			planStyle,
			notifications,
			quietHours,
		};
		writeTeacherOnboarding(prefs);
		onCompleted?.(prefs);
		onOpenChange(false);
		setStep(0);
	}

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full sm:max-w-md">
				{step === 0 ? (
					<>
						<SheetHeader>
							<SheetTitle>Welcome to your command center</SheetTitle>
							<SheetDescription>
								We&apos;ll keep routine work under three seconds — you approve, we prep.
							</SheetDescription>
						</SheetHeader>
						<div className="space-y-3 px-4 py-2 text-[13px] text-muted-foreground">
							<div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
								<HugeiconsIcon
									icon={UserGroupIcon}
									strokeWidth={2}
									className="mt-0.5 size-5 text-primary"
								/>
								<p>
									You have <span className="font-medium text-foreground">{classCount}</span> class
									{classCount === 1 ? "" : "es"}
									{homeroomCount > 0
										? ` including ${homeroomCount} homeroom${homeroomCount === 1 ? "" : "s"} for attendance`
										: ""}
									.
								</p>
							</div>
							<ul className="list-inside list-disc space-y-1 leading-relaxed">
								<li>Confirm all present from the dashboard or attendance page</li>
								<li>Assign homework with AI from any class roster</li>
								<li>See your next period and watch list on the sidebar</li>
							</ul>
						</div>
						<SheetFooter className="border-t px-4 py-3">
							<Button onClick={() => setStep(1)}>Continue</Button>
						</SheetFooter>
					</>
				) : null}

				{step === 1 ? (
					<>
						<SheetHeader>
							<SheetTitle>How do you like plans?</SheetTitle>
							<SheetDescription>
								This tunes copy on your home screen (more personalization in later phases).
							</SheetDescription>
						</SheetHeader>
						<Field className="px-4 py-2">
							<FieldLabel>Default plan style</FieldLabel>
							<SelectField
								items={planOptions}
								value={planStyle}
								onValueChange={(value) => setPlanStyle(value as TeacherPlanStyle)}
							/>
						</Field>
						<SheetFooter className="gap-2 border-t px-4 py-3 sm:justify-between">
							<Button variant="outline" onClick={() => setStep(0)}>
								Back
							</Button>
							<Button onClick={() => setStep(2)}>Next</Button>
						</SheetFooter>
					</>
				) : null}

				{step === 2 ? (
					<>
						<SheetHeader>
							<SheetTitle>Notifications & quiet hours</SheetTitle>
							<SheetDescription>
								Stored on this device for now — org-wide prefs ship in Phase 2.
							</SheetDescription>
						</SheetHeader>
						<div className="space-y-4 px-4 py-2">
							<Field>
								<FieldLabel>Email / push (when enabled)</FieldLabel>
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
										Show when parent messages are paused overnight
									</p>
								</div>
								<Checkbox
									checked={quietHours}
									onCheckedChange={(checked) => setQuietHours(checked === true)}
									aria-label="Show quiet hours badge on home"
								/>
							</div>
							<div className="flex items-center gap-2 text-[12px] text-muted-foreground">
								<HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-4" />
								You can change these anytime from home (coming soon).
							</div>
						</div>
						<SheetFooter className="gap-2 border-t px-4 py-3 sm:justify-between">
							<Button variant="outline" onClick={() => setStep(1)}>
								Back
							</Button>
							<Button onClick={finish}>Start teaching</Button>
						</SheetFooter>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
