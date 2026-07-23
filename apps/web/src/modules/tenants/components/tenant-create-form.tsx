"use client";

import { Building03Icon } from "@hugeicons/core-free-icons";
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
import { Textarea } from "@school-os/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTenantContext } from "../context/tenant-context";
import { useCreateTenantMutation } from "../hooks/use-tenant-mutations";
import type { CreateTenantFormValues } from "../schemas/tenant.schemas";
import { createTenantSchema } from "../schemas/tenant.schemas";

const defaultValues: CreateTenantFormValues = {
	name: "",
	slug: "",
	mission: "",
	timezone: "Asia/Karachi",
	defaultLocale: "en",
};

export function TenantCreateForm() {
	const router = useRouter();
	const { setActiveTenantId } = useTenantContext();
	const createTenant = useCreateTenantMutation();
	const [values, setValues] = useState(defaultValues);
	const [fieldError, setFieldError] = useState<string | null>(null);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setFieldError(null);

		const parsed = createTenantSchema.safeParse(values);
		if (!parsed.success) {
			setFieldError(parsed.error.issues[0]?.message ?? "Invalid input");
			return;
		}

		try {
			const result = await createTenant.mutateAsync(parsed.data);
			setActiveTenantId(result.tenant.id);
			router.push(`/admin/tenants/${result.tenant.id}/campuses`);
		} catch (error) {
			setFieldError(error instanceof Error ? error.message : "Could not create organization");
		}
	}

	return (
		<Card className="mx-auto w-full max-w-lg rounded-[16px] border border-dashboard-border bg-dashboard-surface">
			<CardHeader>
				<div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
					<HugeiconsIcon icon={Building03Icon} size={20} strokeWidth={1.8} />
				</div>
				<CardTitle className="text-xl">Set up your school organization</CardTitle>
				<CardDescription>
					Create a tenant for your school network. You&apos;ll add campuses next.
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

						<Field>
							<FieldLabel htmlFor="tenant-name">Organization name</FieldLabel>
							<Input
								id="tenant-name"
								className="h-9"
								value={values.name}
								onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
								placeholder="AKES Network"
								required
								maxLength={200}
							/>
							<FieldDescription>The legal or brand name of your school group.</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor="tenant-slug">URL slug (optional)</FieldLabel>
							<Input
								id="tenant-slug"
								className="h-9"
								value={values.slug ?? ""}
								onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
								placeholder="akes-network"
								maxLength={80}
							/>
							<FieldDescription>Auto-generated from the name if left blank.</FieldDescription>
						</Field>

						<Field>
							<FieldLabel htmlFor="tenant-mission">Mission (optional)</FieldLabel>
							<Textarea
								id="tenant-mission"
								className="min-h-20 resize-y"
								value={values.mission ?? ""}
								onChange={(e) => setValues((v) => ({ ...v, mission: e.target.value }))}
								placeholder="Quality education across Pakistan"
								maxLength={2000}
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

						<Button type="submit" className="w-full" disabled={createTenant.isPending}>
							{createTenant.isPending ? (
								<>
									<Spinner className="size-4" />
									Creating…
								</>
							) : (
								"Create organization"
							)}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
