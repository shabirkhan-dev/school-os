import { apiClient } from "@/lib/api/client";
import type {
	AcceptInviteResult,
	InviteMemberInput,
	InvitePreview,
	MembersListResponse,
	PendingInvite,
	UpdateMemberInput,
	UserPendingInvite,
} from "../types/member.types";

export const membersService = {
	list: (accessToken: string, tenantId: string) =>
		apiClient.get<MembersListResponse>(`/tenants/${tenantId}/members`, { accessToken }),
	invite: (accessToken: string, tenantId: string, input: InviteMemberInput) =>
		apiClient.post<{ invite: PendingInvite; developmentInviteUrl?: string }>(
			`/tenants/${tenantId}/members/invite`,
			input,
			{ accessToken },
		),
	update: (accessToken: string, tenantId: string, membershipId: string, input: UpdateMemberInput) =>
		apiClient.patch<{ member: MembersListResponse["members"][number] }>(
			`/tenants/${tenantId}/members/${membershipId}`,
			input,
			{ accessToken },
		),
	revokeInvite: (accessToken: string, tenantId: string, inviteId: string) =>
		apiClient.delete<{ revoked: true }>(`/tenants/${tenantId}/members/invites/${inviteId}`, {
			accessToken,
		}),
	resendInvite: (accessToken: string, tenantId: string, inviteId: string) =>
		apiClient.post<{ invite: PendingInvite; developmentInviteUrl?: string }>(
			`/tenants/${tenantId}/members/invites/${inviteId}/resend`,
			{},
			{ accessToken },
		),
	previewInvite: (token: string) =>
		apiClient.get<{ invite: InvitePreview }>(
			`/auth/invites/preview?token=${encodeURIComponent(token)}`,
		),
	listPendingInvites: (accessToken: string) =>
		apiClient.get<{ invites: UserPendingInvite[] }>("/auth/pending-invites", { accessToken }),
	acceptInvite: (accessToken: string, input: { token?: string; inviteId?: string }) =>
		apiClient.post<AcceptInviteResult>("/auth/accept-invite", input, { accessToken }),
};
