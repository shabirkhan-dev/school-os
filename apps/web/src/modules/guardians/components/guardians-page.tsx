"use client";

import { Edit02Icon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Badge } from "@school-os/ui/components/badge";
import { Button } from "@school-os/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { SelectField } from "@school-os/ui/components/select-field";
import { Spinner } from "@school-os/ui/components/spinner";
import { useState } from "react";
import { PermissionCodes, usePermissions, useTenantContext } from "@/modules/tenants";
import {
	useCreateGuardianMutation,
	useGuardiansQuery,
	useUpdateGuardianMutation,
} from "../hooks/use-guardian-queries";
import type { Guardian } from "../types/guardian.types";

const channelItems = [
	{ label: "Email", value: "email" },
	{ label: "Phone", value: "phone" },
	{ label: "WhatsApp", value: "whatsapp" },
	{ label: "SMS", value: "sms" },
];

export function GuardiansPage() {
	const { activeTenant } = useTenantContext();
	const { can, isLoading: permissionsLoading } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.GUARDIANS_READ);
	const canWrite = can(PermissionCodes.GUARDIANS_WRITE);

	const query = useGuardiansQuery(tenantId, canRead);
	const createGuardian = useCreateGuardianMutation(tenantId ?? "");
	const updateGuardian = useUpdateGuardianMutation(tenantId ?? "");

	const [editing, setEditing] = useState<Guardian | null>(null);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [occupation, setOccupation] = useState("");
	const [preferredChannel, setPreferredChannel] = useState("email");
	const [error, setError] = useState<string | null>(null);

	function resetForm() {
		setEditing(null);
		setFirstName("");
		setLastName("");
		setEmail("");
		setPhone("");
		setOccupation("");
		setPreferredChannel("email");
		setError(null);
	}

	function startEdit(guardian: Guardian) {
		setEditing(guardian);
		setFirstName(guardian.firstName);
		setLastName(guardian.lastName);
		setEmail(guardian.email ?? "");
		setPhone(guardian.phone ?? "");
		setOccupation(guardian.occupation ?? "");
		setPreferredChannel(guardian.preferredChannel);
		setError(null);
	}

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		if (!tenantId || !canWrite) return;
		setError(null);
		try {
			if (editing) {
				await updateGuardian.mutateAsync({
					guardianId: editing.id,
					input: {
						firstName,
						lastName,
						email: email || undefined,
						phone: phone || undefined,
						occupation: occupation || undefined,
						preferredChannel: preferredChannel as Guardian["preferredChannel"],
					},
				});
			} else {
				await createGuardian.mutateAsync({
					firstName,
					lastName,
					email: email || undefined,
					phone: phone || undefined,
					occupation: occupation || undefined,
					preferredChannel: preferredChannel as Guardian["preferredChannel"],
				});
			}
			resetForm();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save guardian");
		}
	}

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage guardians.</AlertDescription>
			</Alert>
		);
	}

	if (permissionsLoading) {
		return (
			<div className="flex min-h-[240px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	if (!canRead) {
		return (
			<Alert>
				<AlertDescription>You do not have permission to view guardians.</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
			<header className="mb-6 border-dashboard-border border-b pb-5">
				<div className="flex items-center gap-3">
					<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={UserMultiple02Icon} size={20} strokeWidth={1.8} />
					</div>
					<div>
						<h1 className="font-semibold text-[24px] text-dashboard-text-primary">Guardians</h1>
						<p className="text-[13px] text-dashboard-text-muted">
							Parent and guardian contacts linked to students.
						</p>
					</div>
				</div>
			</header>

			{canWrite ? (
				<form
					onSubmit={handleSubmit}
					className="mb-6 rounded-[14px] border border-dashboard-border bg-dashboard-surface p-4"
				>
					<h2 className="mb-3 font-medium text-[14px] text-dashboard-text-primary">
						{editing ? "Edit guardian" : "Add guardian"}
					</h2>
					<FieldGroup className="grid gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor="guardian-first">First name</FieldLabel>
							<Input
								id="guardian-first"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="guardian-last">Last name</FieldLabel>
							<Input
								id="guardian-last"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="guardian-email">Email</FieldLabel>
							<Input
								id="guardian-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="guardian-phone">Phone</FieldLabel>
							<Input id="guardian-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
						</Field>
						<Field>
							<FieldLabel htmlFor="guardian-occupation">Occupation</FieldLabel>
							<Input
								id="guardian-occupation"
								value={occupation}
								onChange={(e) => setOccupation(e.target.value)}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="guardian-channel">Preferred contact</FieldLabel>
							<SelectField
								id="guardian-channel"
								value={preferredChannel}
								onValueChange={setPreferredChannel}
								items={channelItems}
							/>
						</Field>
					</FieldGroup>
					{error ? <p className="mt-3 text-[12px] text-destructive">{error}</p> : null}
					<div className="mt-4 flex gap-2">
						<Button type="submit" disabled={createGuardian.isPending || updateGuardian.isPending}>
							{createGuardian.isPending || updateGuardian.isPending
								? "Saving..."
								: editing
									? "Save changes"
									: "Create guardian"}
						</Button>
						{editing ? (
							<Button type="button" variant="outline" onClick={resetForm}>
								Cancel
							</Button>
						) : null}
					</div>
				</form>
			) : null}

			{query.isLoading ? (
				<div className="flex justify-center py-10">
					<Spinner />
				</div>
			) : (
				<div className="overflow-hidden rounded-[14px] border border-dashboard-border">
					<table className="w-full text-[13px]">
						<thead className="bg-dashboard-surface-strong text-left text-[11px] text-dashboard-text-muted uppercase">
							<tr>
								<th className="px-4 py-2.5">Name</th>
								<th className="px-4 py-2.5">Phone</th>
								<th className="px-4 py-2.5">Email</th>
								<th className="px-4 py-2.5">Portal</th>
								{canWrite ? <th className="px-4 py-2.5 text-right">Actions</th> : null}
							</tr>
						</thead>
						<tbody>
							{(query.data ?? []).map((guardian) => (
								<tr key={guardian.id} className="border-dashboard-border-subtle border-t">
									<td className="px-4 py-3 font-medium">{guardian.fullName}</td>
									<td className="px-4 py-3 text-dashboard-text-secondary">
										{guardian.phone ?? "—"}
									</td>
									<td className="px-4 py-3 text-dashboard-text-secondary">
										{guardian.email ?? "—"}
									</td>
									<td className="px-4 py-3">
										{guardian.membershipId ? (
											<Badge variant="outline">Linked account</Badge>
										) : (
											<span className="text-dashboard-text-muted">Contact only</span>
										)}
									</td>
									{canWrite ? (
										<td className="px-4 py-3">
											<div className="flex justify-end">
												<Button
													type="button"
													size="icon-sm"
													variant="outline"
													aria-label={`Edit ${guardian.fullName}`}
													onClick={() => startEdit(guardian)}
												>
													<HugeiconsIcon icon={Edit02Icon} strokeWidth={2} />
												</Button>
											</div>
										</td>
									) : null}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
