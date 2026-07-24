"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { homeworkQueryKeys } from "../queries/homework-query-keys";
import { homeworkService } from "../services/homework.service";
import type { CreateHomeworkInput, UpdateHomeworkInput } from "../types/homework.types";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useHomeworkListQuery(
	tenantId: string | null,
	filters?: { sectionSubjectId?: string; status?: string; studentId?: string },
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: homeworkQueryKeys.list(
			tenantId ?? "",
			filters?.sectionSubjectId,
			filters?.status,
			filters?.studentId,
		),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant required");
			return homeworkService
				.list(requireToken(token), tenantId, filters)
				.then((response) => response.assignments);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useHomeworkDetailQuery(
	tenantId: string | null,
	homeworkId: string,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: homeworkQueryKeys.detail(tenantId ?? "", homeworkId),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant required");
			return homeworkService
				.getById(requireToken(token), tenantId, homeworkId)
				.then((response) => response.assignment);
		},
		enabled: enabled && Boolean(token && tenantId && homeworkId),
	});
}

export function useCreateHomeworkMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateHomeworkInput) =>
			homeworkService.create(requireToken(token), tenantId, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: homeworkQueryKeys.all(tenantId) });
		},
	});
}

export function useUpdateHomeworkMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ homeworkId, input }: { homeworkId: string; input: UpdateHomeworkInput }) =>
			homeworkService.update(requireToken(token), tenantId, homeworkId, input),
		onSuccess: async (_data, variables) => {
			await queryClient.invalidateQueries({ queryKey: homeworkQueryKeys.all(tenantId) });
			await queryClient.invalidateQueries({
				queryKey: homeworkQueryKeys.detail(tenantId, variables.homeworkId),
			});
		},
	});
}
