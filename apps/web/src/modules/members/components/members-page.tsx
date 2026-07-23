"use client";

import { UserMultiple02Icon } from "@hugeicons/core-free-icons";
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
import { useMemo, useState } from "react";
import { useAuth } from "@/modules/auth";
import {
	type MembershipRole,
	membershipRoleLabels,
	PermissionCodes,
	usePermissions,
	useTenantContext,
} from "@/modules/tenants";
import {
	useInviteMemberMutation,
	useMembersQuery,
	useRevokeInviteMutation,
	useUpdateMemberMutation,
} from "../hooks/use-member-queries";
import type { Member, MemberStatus } from "../types/member.types";

const inviteRoles: Array<Exclude<MembershipRole, "owner">> = [
	"principal",
	"admin",
	"teacher",
	"parent",
	"student",
];

const editableRoles: MembershipRole[] = [
	"owner",
	"principal",
	"admin",
	"teacher",
	"parent",
	"student",
];

const statusOptions: MemberStatus[] = ["active", "invited", "suspended"];

function formatRole(role: MembershipRole): string {
	return membershipRoleLabels[role];
}

export function MembersPage() {
	const { activeTenant } = useTenantContext();
	const { tenantContext } = useAuth();
	const { can } = usePermissions();
	const tenantId = activeTenant?.id ?? null;
	const canRead = can(PermissionCodes.TENANT_MEMBERSHIP_READ);
	const canInvite = can(PermissionCodes.TENANT_MEMBERSHIP_INVITE);
	const canManage = can(PermissionCodes.TENANT_MEMBERSHIP_MANAGE);

	const membersQuery = useMembersQuery(tenantId, canRead);
	const inviteMember = useInviteMemberMutation(tenantId ?? "");
	const updateMember = useUpdateMemberMutation(tenantId ?? "");
	const revokeInvite = useRevokeInviteMutation(tenantId ?? "");

	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<Exclude<MembershipRole, "owner">>("teacher");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const currentMembershipId = tenantContext?.id ?? null;
	const members = membersQuery.data?.members ?? [];
	const pendingInvites = membersQuery.data?.pendingInvites ?? [];

	const sortedMembers = useMemo(
		() =>
			[...members].sort((a, b) => {
				const roleOrder = editableRoles.indexOf(a.role) - editableRoles.indexOf(b.role);
				if (roleOrder !== 0) return roleOrder;
				return a.email.localeCompare(b.email);
			}),
		[members],
	);

	if (!tenantId) {
		return (
			<Alert>
				<AlertDescription>Create an organization first to manage members.</AlertDescription>
			</Alert>
		);
	}

	if (!canRead) {
		return (
			<Alert>
				<AlertDescription>
					You do not have permission to view organization members.
				</AlertDescription>
			</Alert>
		);
	}

	async function handleInvite(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setMessage(null);
		try {
			const result = await inviteMember.mutateAsync({
				email: inviteEmail.trim(),
				role: inviteRole,
			});
			setInviteEmail("");
			setMessage(
				result.developmentInviteUrl
					? `Invite sent. Dev link: ${result.developmentInviteUrl}`
					: `Invite sent to ${result.invite.email}`,
			);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not send invite");
		}
	}

	async function handleUpdateMember(
		membershipId: string,
		input: { role?: MembershipRole; status?: MemberStatus },
	) {
		setError(null);
		setMessage(null);
		try {
			const result = await updateMember.mutateAsync({ membershipId, input });
			setMessage(`Updated ${result.member.email}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not update member");
		}
	}

	async function handleRevokeInvite(inviteId: string, email: string) {
		setError(null);
		setMessage(null);
		try {
			await revokeInvite.mutateAsync(inviteId);
			setMessage(`Revoked invite for ${email}`);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Could not revoke invite");
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-3">
				<div className="flex size-10 items-center justify-center rounded-lg bg-dashboard-accent-soft text-dashboard-accent">
					<HugeiconsIcon icon={UserMultiple02Icon} size={20} strokeWidth={2} />
				</div>
				<div>
					<h1 className="font-semibold text-2xl text-dashboard-text-primary">Members</h1>
					<p className="text-dashboard-text-muted text-sm">
						View roles, invite staff, and manage organization access.
					</p>
				</div>
			</div>

			{error ? (
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : null}
			{message ? (
				<Alert>
					<AlertDescription>{message}</AlertDescription>
				</Alert>
			) : null}

			{canInvite ? (
				<Card className="border-dashboard-border bg-dashboard-surface">
					<CardHeader>
						<CardTitle>Invite member</CardTitle>
						<CardDescription>
							Send an email invite. They can sign up or sign in with the invited address to join.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleInvite}>
							<FieldGroup className="grid gap-4 md:grid-cols-[1fr_180px_auto]">
								<Field>
									<FieldLabel htmlFor="invite-email">Email</FieldLabel>
									<Input
										id="invite-email"
										type="email"
										value={inviteEmail}
										onChange={(event) => setInviteEmail(event.target.value)}
										placeholder="teacher@school.edu"
										required
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="invite-role">Role</FieldLabel>
									<select
										id="invite-role"
										className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
										value={inviteRole}
										onChange={(event) =>
											setInviteRole(event.target.value as Exclude<MembershipRole, "owner">)
										}
									>
										{inviteRoles.map((role) => (
											<option key={role} value={role}>
												{formatRole(role)}
											</option>
										))}
									</select>
								</Field>
								<div className="flex items-end">
									<Button type="submit" disabled={inviteMember.isPending}>
										{inviteMember.isPending ? <Spinner className="size-4" /> : "Send invite"}
									</Button>
								</div>
							</FieldGroup>
						</form>
					</CardContent>
				</Card>
			) : null}

			<Card className="border-dashboard-border bg-dashboard-surface">
				<CardHeader>
					<CardTitle>Current members</CardTitle>
					<CardDescription>
						{membersQuery.isLoading
							? "Loading members…"
							: `${sortedMembers.length} member${sortedMembers.length === 1 ? "" : "s"}`}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{membersQuery.isLoading ? (
						<div className="flex justify-center py-8">
							<Spinner className="size-6 text-muted-foreground" />
						</div>
					) : sortedMembers.length === 0 ? (
						<p className="text-dashboard-text-muted text-sm">No members yet.</p>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[640px] text-left text-sm">
								<thead>
									<tr className="border-dashboard-border border-b text-dashboard-text-dim">
										<th className="px-2 py-2 font-medium">User</th>
										<th className="px-2 py-2 font-medium">Role</th>
										<th className="px-2 py-2 font-medium">Status</th>
										{canManage ? <th className="px-2 py-2 font-medium">Actions</th> : null}
									</tr>
								</thead>
								<tbody>
									{sortedMembers.map((member) => (
										<MemberRow
											key={member.id}
											member={member}
											canManage={canManage}
											isSelf={member.id === currentMembershipId}
											onUpdate={handleUpdateMember}
											pending={updateMember.isPending}
										/>
									))}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>

			{pendingInvites.length > 0 ? (
				<Card className="border-dashboard-border bg-dashboard-surface">
					<CardHeader>
						<CardTitle>Pending invites</CardTitle>
						<CardDescription>Invites waiting for the recipient to accept.</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className="divide-y divide-dashboard-border">
							{pendingInvites.map((invite) => (
								<li
									key={invite.id}
									className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
								>
									<div>
										<div className="font-medium text-dashboard-text-secondary">{invite.email}</div>
										<div className="text-dashboard-text-dim text-xs">
											{formatRole(invite.role)} · expires{" "}
											{new Date(invite.expiresAt).toLocaleDateString()}
										</div>
									</div>
									{canInvite ? (
										<Button
											variant="outline"
											size="sm"
											disabled={revokeInvite.isPending}
											onClick={() => void handleRevokeInvite(invite.id, invite.email)}
										>
											Revoke
										</Button>
									) : null}
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			) : null}
		</div>
	);
}

function MemberRow({
	member,
	canManage,
	isSelf,
	onUpdate,
	pending,
}: {
	member: Member;
	canManage: boolean;
	isSelf: boolean;
	onUpdate: (
		membershipId: string,
		input: { role?: MembershipRole; status?: MemberStatus },
	) => Promise<void>;
	pending: boolean;
}) {
	const [role, setRole] = useState(member.role);
	const [status, setStatus] = useState(member.status);

	return (
		<tr className="border-dashboard-border border-b last:border-0">
			<td className="px-2 py-3">
				<div className="font-medium text-dashboard-text-secondary">{member.username}</div>
				<div className="text-dashboard-text-dim text-xs">{member.email}</div>
			</td>
			<td className="px-2 py-3">
				{canManage && !isSelf ? (
					<select
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={role}
						onChange={(event) => setRole(event.target.value as MembershipRole)}
					>
						{editableRoles.map((option) => (
							<option key={option} value={option}>
								{formatRole(option)}
							</option>
						))}
					</select>
				) : (
					formatRole(member.role)
				)}
			</td>
			<td className="px-2 py-3 capitalize">
				{canManage && !isSelf ? (
					<select
						className="h-9 rounded-md border border-input bg-background px-2 text-sm"
						value={status}
						onChange={(event) => setStatus(event.target.value as MemberStatus)}
					>
						{statusOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				) : (
					member.status
				)}
			</td>
			{canManage ? (
				<td className="px-2 py-3">
					{isSelf ? (
						<span className="text-dashboard-text-dim text-xs">You</span>
					) : (
						<Button
							variant="outline"
							size="sm"
							disabled={pending || (role === member.role && status === member.status)}
							onClick={() => void onUpdate(member.id, { role, status })}
						>
							Save
						</Button>
					)}
				</td>
			) : null}
		</tr>
	);
}
