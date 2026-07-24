"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requireToken } from "@/lib/api/require-token";
import { useAuth } from "@/modules/auth/context/auth-context";
import { assessmentsQueryKeys } from "../queries/assessments-query-keys";
import { assessmentsService } from "../services/assessments.service";
import type {
	CreateAssessmentInput,
	UpdateAssessmentInput,
	UpsertAssessmentResultsInput,
} from "../types/assessments.types";

export function useAssessmentsListQuery(
	tenantId: string | null,
	filters?: { sectionSubjectId?: string; status?: string },
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: assessmentsQueryKeys.list(tenantId ?? "", filters?.sectionSubjectId, filters?.status),
		queryFn: () => {
			if (!tenantId) throw new Error("Tenant required");
			return assessmentsService
				.list(requireToken(token), tenantId, filters)
				.then((response) => response.assessments);
		},
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useAssessmentsPlannerQuery(
	tenantId: string | null,
	range: { from: string; to: string; sectionSubjectId?: string } | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: assessmentsQueryKeys.planner(
			tenantId ?? "",
			range?.from ?? "",
			range?.to ?? "",
			range?.sectionSubjectId,
		),
		queryFn: () => {
			if (!tenantId || !range) throw new Error("Tenant and range required");
			return assessmentsService
				.planner(requireToken(token), tenantId, range)
				.then((response) => response.assessments);
		},
		enabled: enabled && Boolean(token && tenantId && range?.from && range?.to),
	});
}

export function useAssessmentDetailQuery(
	tenantId: string | null,
	assessmentId: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: assessmentsQueryKeys.detail(tenantId ?? "", assessmentId ?? ""),
		queryFn: () => {
			if (!tenantId || !assessmentId) throw new Error("Tenant and assessment required");
			return assessmentsService
				.getById(requireToken(token), tenantId, assessmentId)
				.then((response) => response.assessment);
		},
		enabled: enabled && Boolean(token && tenantId && assessmentId),
	});
}

export function useCreateAssessmentMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateAssessmentInput) =>
			assessmentsService.create(requireToken(token), tenantId, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: assessmentsQueryKeys.all(tenantId) });
		},
	});
}

export function useUpdateAssessmentMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ assessmentId, input }: { assessmentId: string; input: UpdateAssessmentInput }) =>
			assessmentsService.update(requireToken(token), tenantId, assessmentId, input),
		onSuccess: async (_data, variables) => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: assessmentsQueryKeys.all(tenantId) }),
				queryClient.invalidateQueries({
					queryKey: assessmentsQueryKeys.detail(tenantId, variables.assessmentId),
				}),
			]);
		},
	});
}

export function useUpsertAssessmentResultsMutation(tenantId: string, assessmentId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpsertAssessmentResultsInput) =>
			assessmentsService.upsertResults(requireToken(token), tenantId, assessmentId, input),
		onSuccess: async () => {
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: assessmentsQueryKeys.all(tenantId) }),
				queryClient.invalidateQueries({
					queryKey: assessmentsQueryKeys.detail(tenantId, assessmentId),
				}),
			]);
		},
	});
}
