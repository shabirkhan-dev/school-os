"use client";

import { ColorsIcon, Megaphone01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@school-os/ui/components/card";
import { Checkbox } from "@school-os/ui/components/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { useEffect, useState } from "react";
import { useUpdateOrganizationConfigMutation } from "../hooks/use-tenant-mutations";
import type { OrganizationConfig } from "../types/tenant.types";

const monthLabels = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

type TenantOrganizationConfigFormProps = {
	tenantId: string;
	config: OrganizationConfig;
};

export function TenantOrganizationConfigForm({
	tenantId,
	config,
}: TenantOrganizationConfigFormProps) {
	const updateConfig = useUpdateOrganizationConfigMutation(tenantId);
	const [settings, setSettings] = useState(config.settings);
	const [branding, setBranding] = useState(config.branding);
	const [communicationPolicy, setCommunicationPolicy] = useState(config.communicationPolicy);
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		setSettings(config.settings);
		setBranding(config.branding);
		setCommunicationPolicy(config.communicationPolicy);
	}, [config]);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setFieldError(null);
		setSuccess(null);

		const payload = {
			settings: {
				academicYearStartMonth: settings.academicYearStartMonth,
				attendanceGraceMinutes: settings.attendanceGraceMinutes,
				quietHoursStart: settings.quietHoursStart,
				quietHoursEnd: settings.quietHoursEnd,
			},
			branding: {
				displayNameEn: branding.displayNameEn?.trim() || null,
				displayNameUr: branding.displayNameUr?.trim() || null,
				logoUrl: branding.logoUrl?.trim() || null,
				primaryColor: branding.primaryColor?.trim() || null,
				accentColor: branding.accentColor?.trim() || null,
			},
			communicationPolicy,
		};

		try {
			await updateConfig.mutateAsync(payload);
			setSuccess("Organization policies saved");
		} catch (error) {
			setFieldError(error instanceof Error ? error.message : "Could not save policies");
		}
	}

	return (
		<form className="space-y-6" onSubmit={(e) => void handleSubmit(e)}>
			{fieldError ? (
				<Alert variant="destructive">
					<AlertDescription>{fieldError}</AlertDescription>
				</Alert>
			) : null}
			{success ? (
				<Alert>
					<AlertDescription>{success}</AlertDescription>
				</Alert>
			) : null}

			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
				<CardHeader>
					<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={Settings02Icon} size={20} strokeWidth={1.8} />
					</div>
					<CardTitle className="text-lg">Academic & quiet hours</CardTitle>
					<CardDescription>
						Grace windows and do-not-disturb hours for automated parent messages.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="academic-year-start">Academic year starts</FieldLabel>
								<select
									id="academic-year-start"
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
									value={settings.academicYearStartMonth}
									onChange={(e) =>
										setSettings((current) => ({
											...current,
											academicYearStartMonth: Number(e.target.value),
										}))
									}
								>
									{monthLabels.map((label, index) => (
										<option key={label} value={index + 1}>
											{label}
										</option>
									))}
								</select>
							</Field>
							<Field>
								<FieldLabel htmlFor="attendance-grace">Attendance grace (minutes)</FieldLabel>
								<Input
									id="attendance-grace"
									type="number"
									min={0}
									max={120}
									className="h-9"
									value={settings.attendanceGraceMinutes}
									onChange={(e) =>
										setSettings((current) => ({
											...current,
											attendanceGraceMinutes: Number(e.target.value),
										}))
									}
								/>
							</Field>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="quiet-hours-start">Quiet hours start</FieldLabel>
								<Input
									id="quiet-hours-start"
									type="time"
									className="h-9"
									value={settings.quietHoursStart}
									onChange={(e) =>
										setSettings((current) => ({
											...current,
											quietHoursStart: e.target.value,
										}))
									}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="quiet-hours-end">Quiet hours end</FieldLabel>
								<Input
									id="quiet-hours-end"
									type="time"
									className="h-9"
									value={settings.quietHoursEnd}
									onChange={(e) =>
										setSettings((current) => ({
											...current,
											quietHoursEnd: e.target.value,
										}))
									}
								/>
							</Field>
						</div>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
				<CardHeader>
					<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={ColorsIcon} size={20} strokeWidth={1.8} />
					</div>
					<CardTitle className="text-lg">Branding</CardTitle>
					<CardDescription>Display names and colors shown to families and staff.</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-4">
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="display-name-en">Display name (English)</FieldLabel>
								<Input
									id="display-name-en"
									className="h-9"
									value={branding.displayNameEn ?? ""}
									onChange={(e) =>
										setBranding((current) => ({
											...current,
											displayNameEn: e.target.value,
										}))
									}
									maxLength={200}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="display-name-ur">Display name (Urdu)</FieldLabel>
								<Input
									id="display-name-ur"
									className="h-9"
									dir="rtl"
									value={branding.displayNameUr ?? ""}
									onChange={(e) =>
										setBranding((current) => ({
											...current,
											displayNameUr: e.target.value,
										}))
									}
									maxLength={200}
								/>
							</Field>
						</div>
						<Field>
							<FieldLabel htmlFor="logo-url">Logo URL</FieldLabel>
							<Input
								id="logo-url"
								type="url"
								className="h-9"
								value={branding.logoUrl ?? ""}
								onChange={(e) =>
									setBranding((current) => ({
										...current,
										logoUrl: e.target.value,
									}))
								}
								placeholder="https://…"
							/>
						</Field>
						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="primary-color">Primary color</FieldLabel>
								<Input
									id="primary-color"
									className="h-9"
									value={branding.primaryColor ?? ""}
									onChange={(e) =>
										setBranding((current) => ({
											...current,
											primaryColor: e.target.value,
										}))
									}
									placeholder="#0066CC"
									maxLength={7}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="accent-color">Accent color</FieldLabel>
								<Input
									id="accent-color"
									className="h-9"
									value={branding.accentColor ?? ""}
									onChange={(e) =>
										setBranding((current) => ({
											...current,
											accentColor: e.target.value,
										}))
									}
									placeholder="#FFB020"
									maxLength={7}
								/>
							</Field>
						</div>
					</FieldGroup>
				</CardContent>
			</Card>

			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
				<CardHeader>
					<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={Megaphone01Icon} size={20} strokeWidth={1.8} />
					</div>
					<CardTitle className="text-lg">Communication policies</CardTitle>
					<CardDescription>
						Channel waterfall and guardian notification rules for alerts and sick reports.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<FieldGroup className="gap-4">
						<PolicyToggle
							id="whatsapp-enabled"
							label="WhatsApp primary channel"
							description="Try WhatsApp first for parent alerts when numbers are verified."
							checked={communicationPolicy.whatsappEnabled}
							onCheckedChange={(checked) =>
								setCommunicationPolicy((current) => ({
									...current,
									whatsappEnabled: checked,
								}))
							}
						/>
						<PolicyToggle
							id="sms-fallback"
							label="SMS fallback"
							description="Send SMS when WhatsApp delivery fails."
							checked={communicationPolicy.smsFallbackEnabled}
							onCheckedChange={(checked) =>
								setCommunicationPolicy((current) => ({
									...current,
									smsFallbackEnabled: checked,
								}))
							}
						/>
						<PolicyToggle
							id="email-fallback"
							label="Email fallback"
							description="Send email when higher-priority channels fail."
							checked={communicationPolicy.emailFallbackEnabled}
							onCheckedChange={(checked) =>
								setCommunicationPolicy((current) => ({
									...current,
									emailFallbackEnabled: checked,
								}))
							}
						/>
						<PolicyToggle
							id="notify-all-guardians"
							label="Notify all linked guardians"
							description="When off, only the primary guardian receives automated alerts."
							checked={communicationPolicy.notifyAllGuardians}
							onCheckedChange={(checked) =>
								setCommunicationPolicy((current) => ({
									...current,
									notifyAllGuardians: checked,
								}))
							}
						/>
						<PolicyToggle
							id="sick-report-note"
							label="Require note for sick reports"
							description="Parents must add a short note when reporting absence due to illness."
							checked={communicationPolicy.sickReportRequiresNote}
							onCheckedChange={(checked) =>
								setCommunicationPolicy((current) => ({
									...current,
									sickReportRequiresNote: checked,
								}))
							}
						/>
					</FieldGroup>
				</CardContent>
			</Card>

			<Button type="submit" disabled={updateConfig.isPending}>
				{updateConfig.isPending ? (
					<>
						<Spinner className="size-4" />
						Saving…
					</>
				) : (
					"Save policies"
				)}
			</Button>
		</form>
	);
}

type PolicyToggleProps = {
	id: string;
	label: string;
	description: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

function PolicyToggle({ id, label, description, checked, onCheckedChange }: PolicyToggleProps) {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-dashboard-border/70 p-3">
			<Checkbox
				id={id}
				checked={checked}
				onCheckedChange={(value) => onCheckedChange(value === true)}
				className="mt-0.5"
			/>
			<div className="min-w-0">
				<FieldLabel htmlFor={id} className="cursor-pointer font-medium">
					{label}
				</FieldLabel>
				<FieldDescription>{description}</FieldDescription>
			</div>
		</div>
	);
}
