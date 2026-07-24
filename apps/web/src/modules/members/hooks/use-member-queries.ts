"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { memberQueryKeys } from "../queries/member-query-keys";
import { membersService } from "../services/members.service";
import type { InviteMemberInput, UpdateMemberInput } from "../types/member.types";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useMembersQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: memberQueryKeys.list(tenantId ?? ""),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant id required");
			return membersService.list(requireToken(token), tenantId);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function usePendingInvitesQuery(enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: memberQueryKeys.pendingInvites(),
		queryFn: () => membersService.listPendingInvites(requireToken(token)),
		enabled: enabled && Boolean(token),
	});
}

export function useInviteMemberMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: InviteMemberInput) =>
			membersService.invite(requireToken(token), tenantId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(tenantId) });
		},
	});
}

export function useUpdateMemberMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ membershipId, input }: { membershipId: string; input: UpdateMemberInput }) =>
			membersService.update(requireToken(token), tenantId, membershipId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(tenantId) });
		},
	});
}

export function useAddMemberRoleMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			membershipId,
			role,
		}: {
			membershipId: string;
			role: "teacher" | "parent" | "student";
		}) => membersService.addRole(requireToken(token), tenantId, membershipId, role),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(tenantId) });
		},
	});
}

export function useRevokeInviteMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (inviteId: string) =>
			membersService.revokeInvite(requireToken(token), tenantId, inviteId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(tenantId) });
		},
	});
}

export function useResendInviteMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (inviteId: string) =>
			membersService.resendInvite(requireToken(token), tenantId, inviteId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: memberQueryKeys.list(tenantId) });
		},
	});
}
