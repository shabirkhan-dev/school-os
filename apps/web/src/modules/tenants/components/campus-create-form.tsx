"use client";

import { Location01Icon } from "@hugeicons/core-free-icons";
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { useState } from "react";
import { PermissionCodes } from "../constants/permission-codes";
import { usePermissions } from "../hooks/use-permissions";
import { useCreateCampusMutation } from "../hooks/use-tenant-mutations";
import type { CreateCampusFormValues } from "../schemas/tenant.schemas";
import { createCampusSchema } from "../schemas/tenant.schemas";

type CampusCreateFormProps = {
	tenantId: string;
	onCreated?: () => void;
};

const defaultValues: CreateCampusFormValues = {
	name: "",
	code: "",
	address: "",
};

export function CampusCreateForm({ tenantId, onCreated }: CampusCreateFormProps) {
	const { can, isLoading: permissionsLoading } = usePermissions();
	const canCreateCampus = can(PermissionCodes.TENANT_CAMPUS_CREATE);
	const createCampus = useCreateCampusMutation(tenantId);
	const [values, setValues] = useState(defaultValues);
	const [fieldError, setFieldError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setFieldError(null);
		setSuccess(null);

		const parsed = createCampusSchema.safeParse(values);
		if (!parsed.success) {
			setFieldError(parsed.error.issues[0]?.message ?? "Invalid input");
			return;
		}

		try {
			const result = await createCampus.mutateAsync(parsed.data);
			setValues(defaultValues);
			setSuccess(`${result.campus.name} added successfully`);
			onCreated?.();
		} catch (error) {
			setFieldError(error instanceof Error ? error.message : "Could not create campus");
		}
	}

	if (permissionsLoading) {
		return (
			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
				<CardContent className="flex min-h-[220px] items-center justify-center py-8">
					<Spinner className="size-6 text-dashboard-accent" />
				</CardContent>
			</Card>
		);
	}

	if (!canCreateCampus) {
		return (
			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
				<CardHeader>
					<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={Location01Icon} size={20} strokeWidth={1.8} />
					</div>
					<CardTitle className="text-lg">Campus management</CardTitle>
					<CardDescription>
						Your role can view campuses but cannot create new ones. Contact an organization admin if
						you need a campus added.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface">
			<CardHeader>
				<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
					<HugeiconsIcon icon={Location01Icon} size={20} strokeWidth={1.8} />
				</div>
				<CardTitle className="text-lg">Add campus</CardTitle>
				<CardDescription>
					Each physical school site gets a unique code within your organization.
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

						<div className="grid gap-4 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor="campus-name">Campus name</FieldLabel>
								<Input
									id="campus-name"
									className="h-9"
									value={values.name}
									onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
									placeholder="AKES Karachi"
									required
									maxLength={200}
								/>
							</Field>
							<Field>
								<FieldLabel htmlFor="campus-code">Campus code</FieldLabel>
								<Input
									id="campus-code"
									className="h-9 uppercase"
									value={values.code}
									onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
									placeholder="KHI-01"
									required
									maxLength={32}
								/>
								<FieldDescription>Unique within your organization.</FieldDescription>
							</Field>
						</div>

						<Field>
							<FieldLabel htmlFor="campus-address">Address (optional)</FieldLabel>
							<Input
								id="campus-address"
								className="h-9"
								value={values.address ?? ""}
								onChange={(e) => setValues((v) => ({ ...v, address: e.target.value }))}
								placeholder="Karachi, Pakistan"
								maxLength={500}
							/>
						</Field>

						<Button type="submit" disabled={createCampus.isPending}>
							{createCampus.isPending ? (
								<>
									<Spinner className="size-4" />
									Adding…
								</>
							) : (
								"Add campus"
							)}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
