import { apiClient } from "@/lib/api/client";
import type {
	AcceptInviteResult,
	InviteMemberInput,
	InvitePreview,
	Member,
	PendingInvite,
	UpdateMemberInput,
} from "../types/member.types";

export const membersService = {
	list: (accessToken: string, tenantId: string) =>
		apiClient.get<{ members: Member[]; pendingInvites: PendingInvite[] }>(
			`/tenants/${tenantId}/members`,
			{ accessToken },
		),
	invite: (accessToken: string, tenantId: string, input: InviteMemberInput) =>
		apiClient.post<{ invite: PendingInvite; developmentInviteUrl?: string }>(
			`/tenants/${tenantId}/members/invite`,
			input,
			{ accessToken },
		),
	update: (accessToken: string, tenantId: string, membershipId: string, input: UpdateMemberInput) =>
		apiClient.patch<{ member: Member }>(`/tenants/${tenantId}/members/${membershipId}`, input, {
			accessToken,
		}),
	revokeInvite: (accessToken: string, tenantId: string, inviteId: string) =>
		apiClient.delete<{ revoked: true }>(`/tenants/${tenantId}/members/invites/${inviteId}`, {
			accessToken,
		}),
	previewInvite: (token: string) =>
		apiClient.get<{ invite: InvitePreview }>(
			`/auth/invites/preview?token=${encodeURIComponent(token)}`,
		),
	listPendingInvites: (accessToken: string) =>
		apiClient.get<{
			invites: Array<{
				inviteId: string;
				tenantId: string;
				tenantName: string;
				email: string;
				role: InvitePreview["role"];
				expiresAt: string;
			}>;
		}>("/auth/pending-invites", { accessToken }),
	acceptInvite: (accessToken: string, token: string) =>
		apiClient.post<AcceptInviteResult>("/auth/accept-invite", { token }, { accessToken }),
};
