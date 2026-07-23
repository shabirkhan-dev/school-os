"use client";

import { Settings02Icon } from "@hugeicons/core-free-icons";
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
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { Textarea } from "@school-os/ui/components/textarea";
import { useEffect, useState } from "react";
import { useUpdateTenantMutation } from "../hooks/use-tenant-mutations";
import type { UpdateTenantFormValues } from "../schemas/tenant.schemas";
import { updateTenantSchema } from "../schemas/tenant.schemas";
import type { Tenant } from "../types/tenant.types";

type TenantSettingsFormProps = {
	tenant: Tenant;
};

export function TenantSettingsForm({ tenant }: TenantSettingsFormProps) {
	const updateTenant = useUpdateTenantMutation(tenant.id);
	const [values, setValues] = useState<UpdateTenantFormValues>({
		name: tenant.name,
		mission: tenant.mission ?? "",
		timezone: tenant.timezone,
		defaultLocale: tenant.defaultLocale,
	});
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	useEffect(() => {
		setValues({
			name: tenant.name,
			mission: tenant.mission ?? "",
			timezone: tenant.timezone,
			defaultLocale: tenant.defaultLocale,
		});
	}, [tenant]);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setFieldError(null);
		setSuccess(null);

		const parsed = updateTenantSchema.safeParse({
			...values,
			mission: values.mission === "" ? null : values.mission,
		});
		if (!parsed.success) {
			setFieldError(parsed.error.issues[0]?.message ?? "Invalid input");
			return;
		}

		try {
			await updateTenant.mutateAsync(parsed.data);
			setSuccess("Organization settings saved");
		} catch (error) {
			setFieldError(error instanceof Error ? error.message : "Could not save settings");
		}
	}

	return (
		<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
			<CardHeader>
				<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
					<HugeiconsIcon icon={Settings02Icon} size={20} strokeWidth={1.8} />
				</div>
				<CardTitle className="text-lg">Organization settings</CardTitle>
				<CardDescription>
					Update your school network name, mission, and locale defaults.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={(e) => void handleSubmit(e)}>
					<FieldGroup className="gap-4">
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

						<Field>
							<FieldLabel htmlFor="tenant-name">Organization name</FieldLabel>
							<Input
								id="tenant-name"
								className="h-9"
								value={values.name ?? ""}
								onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
								required
								maxLength={200}
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="tenant-mission">Mission (optional)</FieldLabel>
							<Textarea
								id="tenant-mission"
								value={values.mission ?? ""}
								onChange={(e) => setValues((v) => ({ ...v, mission: e.target.value }))}
								placeholder="What drives your school network?"
								maxLength={2000}
								rows={3}
							/>
						</Field>

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="tenant-timezone">Timezone</FieldLabel>
								<Input
									id="tenant-timezone"
									className="h-9"
									value={values.timezone ?? ""}
									onChange={(e) => setValues((v) => ({ ...v, timezone: e.target.value }))}
									maxLength={64}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="tenant-locale">Default locale</FieldLabel>
								<Input
									id="tenant-locale"
									className="h-9"
									value={values.defaultLocale ?? ""}
									onChange={(e) => setValues((v) => ({ ...v, defaultLocale: e.target.value }))}
									maxLength={16}
								/>
							</Field>
						</div>

						<Button type="submit" disabled={updateTenant.isPending}>
							{updateTenant.isPending ? (
								<>
									<Spinner className="size-4" />
									Saving…
								</>
							) : (
								"Save settings"
							)}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
