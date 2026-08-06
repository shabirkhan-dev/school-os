import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { staffService } from "@/modules/staff";
import {
	assessmentService,
	attendanceService,
	gradebookService,
	homeworkService,
	reportService,
} from "../services/teacher.service";
import type { GradebookTerm } from "../types/gradebook.types";
import type { ReportTerm } from "../types/report.types";

export const teacherQueryKeys = {
	profile: (tenantId: string | undefined) => ["teacher", tenantId, "profile"] as const,
	sectionStudents: (tenantId: string | undefined, sectionId: string) =>
		["teacher", tenantId, "sections", sectionId, "students"] as const,
	homework: (tenantId: string | undefined, sectionSubjectId?: string) =>
		["teacher", tenantId, "homework", sectionSubjectId ?? "all"] as const,
	homeworkDetail: (tenantId: string | undefined, homeworkId: string) =>
		["teacher", tenantId, "homework", homeworkId] as const,
	submissions: (tenantId: string | undefined, homeworkId: string) =>
		["teacher", tenantId, "homework", homeworkId, "submissions"] as const,
	assessments: (tenantId: string | undefined, sectionSubjectId?: string) =>
		["teacher", tenantId, "assessments", sectionSubjectId ?? "all"] as const,
	assessmentPlanner: (tenantId: string | undefined, from: string, to: string) =>
		["teacher", tenantId, "assessments", "planner", from, to] as const,
	assessmentDetail: (tenantId: string | undefined, assessmentId: string) =>
		["teacher", tenantId, "assessments", assessmentId] as const,
	gradebook: (tenantId: string | undefined, sectionId: string, term: GradebookTerm) =>
		["teacher", tenantId, "gradebook", sectionId, term] as const,
	studentReport: (tenantId: string | undefined, studentId: string, term?: GradebookTerm) =>
		["teacher", tenantId, "gradebook", "student", studentId, term ?? "all"] as const,
	studentAttendance: (tenantId: string | undefined, studentId: string) =>
		["teacher", tenantId, "attendance", "student", studentId] as const,
	reports: (tenantId: string | undefined) => ["teacher", tenantId, "reports"] as const,
	reportOverview: (tenantId: string | undefined, sectionId?: string) =>
		["teacher", tenantId, "reports", "overview", sectionId ?? "all"] as const,
	reportGrades: (tenantId: string | undefined, sectionId: string, term?: ReportTerm) =>
		["teacher", tenantId, "reports", "grades", sectionId, term ?? "all"] as const,
	reportAttendance: (tenantId: string | undefined, sectionId: string) =>
		["teacher", tenantId, "reports", "attendance", sectionId] as const,
	reportHomework: (tenantId: string | undefined, sectionId: string) =>
		["teacher", tenantId, "reports", "homework", sectionId] as const,
};

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useTeacherProfileQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.profile(tenantId ?? undefined),
		queryFn: () => staffService.getMyTeacherProfile(requireToken(token), tenantId as string),
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useSectionStudentsQuery(tenantId: string | null, sectionId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.sectionStudents(tenantId ?? undefined, sectionId),
		queryFn: () =>
			staffService.getMySectionStudents(requireToken(token), tenantId as string, sectionId),
		enabled: Boolean(token && tenantId && sectionId),
	});
}

export function useHomeworkListQuery(
	tenantId: string | null,
	sectionSubjectId?: string,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.homework(tenantId ?? undefined, sectionSubjectId),
		queryFn: () =>
			homeworkService.list(requireToken(token), tenantId as string, {
				...(sectionSubjectId ? { sectionSubjectId } : {}),
			}),
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useHomeworkDetailQuery(tenantId: string | null, homeworkId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.homeworkDetail(tenantId ?? undefined, homeworkId),
		queryFn: () => homeworkService.getById(requireToken(token), tenantId as string, homeworkId),
		enabled: Boolean(token && tenantId && homeworkId),
	});
}

export function useHomeworkSubmissionsQuery(tenantId: string | null, homeworkId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.submissions(tenantId ?? undefined, homeworkId),
		queryFn: () =>
			homeworkService.listSubmissions(requireToken(token), tenantId as string, homeworkId),
		enabled: Boolean(token && tenantId && homeworkId),
	});
}

export function useAssessmentListQuery(
	tenantId: string | null,
	sectionSubjectId?: string,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.assessments(tenantId ?? undefined, sectionSubjectId),
		queryFn: () =>
			assessmentService.list(requireToken(token), tenantId as string, {
				...(sectionSubjectId ? { sectionSubjectId } : {}),
			}),
		enabled: enabled && Boolean(token && tenantId),
	});
}

export function useAssessmentPlannerQuery(tenantId: string | null, from: string, to: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.assessmentPlanner(tenantId ?? undefined, from, to),
		queryFn: () => assessmentService.planner(requireToken(token), tenantId as string, { from, to }),
		enabled: Boolean(token && tenantId && from && to),
	});
}

export function useAssessmentDetailQuery(tenantId: string | null, assessmentId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.assessmentDetail(tenantId ?? undefined, assessmentId),
		queryFn: () => assessmentService.getById(requireToken(token), tenantId as string, assessmentId),
		enabled: Boolean(token && tenantId && assessmentId),
	});
}

export function useGradebookQuery(tenantId: string | null, sectionId: string, term: GradebookTerm) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.gradebook(tenantId ?? undefined, sectionId, term),
		queryFn: () =>
			gradebookService.grid(requireToken(token), tenantId as string, { sectionId, term }),
		enabled: Boolean(token && tenantId && sectionId),
	});
}

export function useStudentReportQuery(
	tenantId: string | null,
	studentId: string,
	term?: GradebookTerm,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.studentReport(tenantId ?? undefined, studentId, term),
		queryFn: () =>
			gradebookService.studentReport(requireToken(token), tenantId as string, studentId, term),
		enabled: Boolean(token && tenantId && studentId),
	});
}

export function useStudentAttendanceHistoryQuery(tenantId: string | null, studentId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.studentAttendance(tenantId ?? undefined, studentId),
		queryFn: () =>
			attendanceService.getStudentHistory(requireToken(token), tenantId as string, studentId),
		enabled: Boolean(token && tenantId && studentId),
	});
}

export function useReportOverviewQuery(tenantId: string | null, sectionId?: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.reportOverview(tenantId ?? undefined, sectionId),
		queryFn: () =>
			reportService.overview(requireToken(token), tenantId as string, {
				...(sectionId ? { sectionId } : {}),
			}),
		enabled: Boolean(token && tenantId),
	});
}

export function useGradesReportQuery(
	tenantId: string | null,
	sectionId: string,
	term?: ReportTerm,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.reportGrades(tenantId ?? undefined, sectionId, term),
		queryFn: () =>
			reportService.grades(requireToken(token), tenantId as string, { sectionId, term }),
		enabled: Boolean(token && tenantId && sectionId),
	});
}

export function useAttendanceReportQuery(tenantId: string | null, sectionId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.reportAttendance(tenantId ?? undefined, sectionId),
		queryFn: () => reportService.attendance(requireToken(token), tenantId as string, { sectionId }),
		enabled: Boolean(token && tenantId && sectionId),
	});
}

export function useHomeworkReportQuery(tenantId: string | null, sectionId: string) {
	const { token } = useAuth();
	return useQuery({
		queryKey: teacherQueryKeys.reportHomework(tenantId ?? undefined, sectionId),
		queryFn: () => reportService.homework(requireToken(token), tenantId as string, { sectionId }),
		enabled: Boolean(token && tenantId && sectionId),
	});
}
