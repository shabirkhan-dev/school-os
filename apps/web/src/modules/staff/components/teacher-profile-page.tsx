"use client";

import { TeacherIcon } from "@hugeicons/core-free-icons";
import { Alert, AlertDescription } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import { Textarea } from "@school-os/ui/components/textarea";
import { useEffect, useState } from "react";
import { AdminPageShell } from "@/components/admin";
import { useTenantContext } from "@/modules/tenants";
import {
	useMyTeacherProfileQuery,
	useUpsertMyTeacherProfileMutation,
} from "../hooks/use-staff-queries";

export function TeacherProfilePage() {
	const { activeTenant } = useTenantContext();
	const tenantId = activeTenant?.id ?? null;
	const profileQuery = useMyTeacherProfileQuery(tenantId);
	const updateProfile = useUpsertMyTeacherProfileMutation(tenantId ?? "");

	const [phone, setPhone] = useState("");
	const [qualification, setQualification] = useState("");
	const [specialization, setSpecialization] = useState("");
	const [notes, setNotes] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const profile = profileQuery.data?.teacher.profile;
		if (!profile) return;
		setPhone(profile.phone ?? "");
		setQualification(profile.qualification ?? "");
		setSpecialization(profile.specialization ?? "");
		setNotes(profile.notes ?? "");
	}, [profileQuery.data?.teacher.profile]);

	async function handleSave() {
		if (!tenantId) return;
		setMessage(null);
		setError(null);
		try {
			await updateProfile.mutateAsync({
				phone: phone || undefined,
				qualification: qualification || undefined,
				specialization: specialization || undefined,
				notes: notes || undefined,
			});
			setMessage("Teaching profile updated.");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not save profile");
		}
	}

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>
					Switch to an organization to edit your teaching profile.
				</AlertDescription>
			</Alert>
		);
	}

	if (profileQuery.isLoading) {
		return (
			<div className="flex min-h-[280px] items-center justify-center">
				<Spinner className="size-6" />
			</div>
		);
	}

	if (profileQuery.isError || !profileQuery.data) {
		return (
			<Alert>
				<AlertDescription>Teaching profile is available for teacher accounts.</AlertDescription>
			</Alert>
		);
	}

	const teacher = profileQuery.data.teacher;

	return (
		<AdminPageShell
			title="Teaching profile"
			description="Update contact and professional details visible to administrators."
			icon={TeacherIcon}
			maxWidth="5xl"
		>
			<div className="mx-auto max-w-xl rounded-xl border border-dashboard-border bg-dashboard-surface p-5 shadow-sm shadow-black/[0.02]">
				<p className="mb-4 text-[13px] text-dashboard-text-secondary">
					Signed in as{" "}
					<span className="font-medium text-dashboard-text-primary">{teacher.email}</span>
					{teacher.profile.employeeCode ? (
						<> · Employee code {teacher.profile.employeeCode}</>
					) : null}
				</p>

				<FieldGroup className="grid gap-4">
					<Field>
						<FieldLabel>Phone</FieldLabel>
						<Input
							value={phone}
							onChange={(event) => setPhone(event.target.value)}
							placeholder="+1 555 0100"
						/>
					</Field>
					<Field>
						<FieldLabel>Qualification</FieldLabel>
						<Input
							value={qualification}
							onChange={(event) => setQualification(event.target.value)}
							placeholder="B.Ed, M.Sc Mathematics"
						/>
					</Field>
					<Field>
						<FieldLabel>Specialization</FieldLabel>
						<Input
							value={specialization}
							onChange={(event) => setSpecialization(event.target.value)}
							placeholder="Primary mathematics"
						/>
					</Field>
					<Field>
						<FieldLabel>Notes</FieldLabel>
						<Textarea
							value={notes}
							onChange={(event) => setNotes(event.target.value)}
							placeholder="Optional notes for administrators"
							rows={3}
						/>
					</Field>
				</FieldGroup>

				{message ? <p className="mt-4 text-[13px] text-emerald-600">{message}</p> : null}
				{error ? <p className="mt-4 text-[13px] text-destructive">{error}</p> : null}

				<div className="mt-5 flex justify-end">
					<Button onClick={() => void handleSave()} disabled={updateProfile.isPending}>
						{updateProfile.isPending ? <Spinner className="size-4" /> : "Save profile"}
					</Button>
				</div>
			</div>
		</AdminPageShell>
	);
}
