"use client";

import { useToast } from "@school-os/ui/components/toaster";
import { ApiError } from "@/lib/api/client";
import type { InviteMemberInput, UpdateMemberInput } from "../types/member.types";
import {
	useInviteMemberMutation,
	useResendInviteMutation,
	useRevokeInviteMutation,
	useUpdateMemberMutation,
} from "./use-member-queries";

function formatError(error: unknown): string {
	if (error instanceof ApiError) return error.message;
	if (error instanceof Error) return error.message;
	return "Something went wrong";
}

export function useMembersActions(tenantId: string) {
	const toast = useToast();
	const inviteMember = useInviteMemberMutation(tenantId);
	const updateMember = useUpdateMemberMutation(tenantId);
	const revokeInvite = useRevokeInviteMutation(tenantId);
	const resendInvite = useResendInviteMutation(tenantId);

	return {
		invite: async (input: InviteMemberInput) => {
			try {
				const result = await inviteMember.mutateAsync(input);
				toast.show({
					title: "Invite sent",
					description: result.developmentInviteUrl
						? `Dev link copied to toast — sent to ${result.invite.email}`
						: `We emailed ${result.invite.email} a secure join link.`,
					status: "success",
					duration: result.developmentInviteUrl ? 8000 : 4200,
				});
				return result;
			} catch (error) {
				toast.show({
					title: "Could not send invite",
					description: formatError(error),
					status: "error",
				});
				throw error;
			}
		},
		update: async (membershipId: string, input: UpdateMemberInput) => {
			try {
				const result = await updateMember.mutateAsync({ membershipId, input });
				toast.show({
					title: "Member updated",
					description: `${result.member.email} is now ${result.member.role} · ${result.member.status}`,
					status: "success",
				});
				return result;
			} catch (error) {
				toast.show({
					title: "Update failed",
					description: formatError(error),
					status: "error",
				});
				throw error;
			}
		},
		revokeInvite: async (inviteId: string, email: string) => {
			try {
				await revokeInvite.mutateAsync(inviteId);
				toast.show({
					title: "Invite revoked",
					description: `${email} can no longer use that link.`,
					status: "success",
				});
			} catch (error) {
				toast.show({
					title: "Could not revoke invite",
					description: formatError(error),
					status: "error",
				});
				throw error;
			}
		},
		resendInvite: async (inviteId: string, email: string) => {
			try {
				const result = await resendInvite.mutateAsync(inviteId);
				toast.show({
					title: "Invite resent",
					description: result.developmentInviteUrl ?? `Fresh link sent to ${email}.`,
					status: "success",
					duration: result.developmentInviteUrl ? 8000 : 4200,
				});
				return result;
			} catch (error) {
				toast.show({
					title: "Could not resend invite",
					description: formatError(error),
					status: "error",
				});
				throw error;
			}
		},
		isPending:
			inviteMember.isPending ||
			updateMember.isPending ||
			revokeInvite.isPending ||
			resendInvite.isPending,
	};
}
