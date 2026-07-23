"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { guardiansService } from "../services/guardians.service";
import type {
	CreateGuardianInput,
	Guardian,
	LinkedStudent,
	LinkStudentGuardianInput,
	UpdateGuardianInput,
} from "../types/guardian.types";

export function useGuardiansQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["guardians", tenantId],
		queryFn: () => {
			if (!tenantId || !token) throw new Error("Auth required");
			return guardiansService.listGuardians(token, tenantId).then((r) => r.guardians as Guardian[]);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useMyChildrenQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: ["guardians", tenantId, "my-children"],
		queryFn: () => {
			if (!tenantId || !token) throw new Error("Auth required");
			return guardiansService
				.getMyChildren(token, tenantId)
				.then((r) => r.children as LinkedStudent[]);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useCreateGuardianMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateGuardianInput) => {
			if (!token) throw new Error("Auth required");
			return guardiansService.createGuardian(token, tenantId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["guardians", tenantId] });
		},
	});
}

export function useUpdateGuardianMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ guardianId, input }: { guardianId: string; input: UpdateGuardianInput }) => {
			if (!token) throw new Error("Auth required");
			return guardiansService.updateGuardian(token, tenantId, guardianId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["guardians", tenantId] });
		},
	});
}

export function useLinkStudentGuardianMutation(tenantId: string, studentId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: LinkStudentGuardianInput) => {
			if (!token) throw new Error("Auth required");
			return guardiansService.linkStudentGuardian(token, tenantId, studentId, input);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ["students", tenantId, "detail", studentId],
			});
			await queryClient.invalidateQueries({ queryKey: ["guardians", tenantId] });
		},
	});
}
