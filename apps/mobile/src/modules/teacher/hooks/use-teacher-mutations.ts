import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { assessmentService, attendanceService, homeworkService } from "../services/teacher.service";
import type {
	CreateAssessmentInput,
	UpdateAssessmentInput,
	UpsertAssessmentResultsInput,
} from "../types/assessment.types";
import type { CreateAttendanceSessionInput, MarkAttendanceInput } from "../types/attendance.types";
import type { CreateHomeworkInput, UpdateHomeworkInput } from "../types/homework.types";
import type { BulkUpdateSubmissionsInput } from "../types/homework-submissions.types";
import { teacherQueryKeys } from "./use-teacher-queries";

/** Prefix for the staff module queries (teacher dashboard, section students). */
function staffKeys(tenantId: string | null): readonly (string | undefined)[] {
	return ["staff", tenantId ?? undefined];
}

export function useCreateHomeworkMutation(tenantId: string | null) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateHomeworkInput) =>
			homeworkService.create(requireToken(token), tenantId as string, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.homework(tenantId ?? undefined),
			});
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.reports(tenantId ?? undefined),
			});
		},
	});
}

export function useUpdateHomeworkMutation(tenantId: string | null, homeworkId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateHomeworkInput) =>
			homeworkService.update(requireToken(token), tenantId as string, homeworkId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.homeworkDetail(tenantId ?? undefined, homeworkId),
			});
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.homework(tenantId ?? undefined),
			});
		},
	});
}

export function useBulkUpdateSubmissionsMutation(tenantId: string | null, homeworkId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: BulkUpdateSubmissionsInput) =>
			homeworkService.bulkUpdateSubmissions(
				requireToken(token),
				tenantId as string,
				homeworkId,
				input,
			),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.submissions(tenantId ?? undefined, homeworkId),
			});
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.reports(tenantId ?? undefined),
			});
		},
	});
}

export function useCreateAssessmentMutation(tenantId: string | null) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateAssessmentInput) =>
			assessmentService.create(requireToken(token), tenantId as string, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.assessments(tenantId ?? undefined),
			});
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.reports(tenantId ?? undefined),
			});
		},
	});
}

export function useUpdateAssessmentMutation(tenantId: string | null, assessmentId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpdateAssessmentInput) =>
			assessmentService.update(requireToken(token), tenantId as string, assessmentId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.assessmentDetail(tenantId ?? undefined, assessmentId),
			});
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.assessments(tenantId ?? undefined),
			});
		},
	});
}

export function useUpsertAssessmentResultsMutation(tenantId: string | null, assessmentId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: UpsertAssessmentResultsInput) =>
			assessmentService.upsertResults(requireToken(token), tenantId as string, assessmentId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.assessmentDetail(tenantId ?? undefined, assessmentId),
			});
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.reports(tenantId ?? undefined),
			});
		},
	});
}

export function useGetOrCreateAttendanceSessionMutation(tenantId: string | null) {
	const { token } = useAuth();
	return useMutation({
		mutationFn: (input: CreateAttendanceSessionInput) =>
			attendanceService.getOrCreateSession(requireToken(token), tenantId as string, input),
	});
}

export function useMarkAttendanceMutation(tenantId: string | null) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ sessionId, input }: { sessionId: string; input: MarkAttendanceInput }) =>
			attendanceService.markAttendance(requireToken(token), tenantId as string, sessionId, input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys(tenantId) });
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.reports(tenantId ?? undefined),
			});
		},
	});
}

export function useConfirmAllPresentMutation(tenantId: string | null) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ sessionId }: { sessionId: string }) =>
			attendanceService.confirmAllPresent(requireToken(token), tenantId as string, sessionId),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys(tenantId) });
			void queryClient.invalidateQueries({
				queryKey: teacherQueryKeys.reports(tenantId ?? undefined),
			});
		},
	});
}

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}
