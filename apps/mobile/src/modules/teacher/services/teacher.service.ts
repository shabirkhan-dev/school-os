import { apiClient } from "@/lib/api/client";
import type {
	Assessment,
	AssessmentDetail,
	CreateAssessmentInput,
	UpdateAssessmentInput,
	UpsertAssessmentResultsInput,
} from "../types/assessment.types";
import type {
	AttendanceSessionView,
	ConfirmAllPresentInput,
	CreateAttendanceSessionInput,
	MarkAttendanceInput,
	StudentAttendanceHistoryEntry,
} from "../types/attendance.types";
import type { GradebookGrid, GradebookTerm, StudentReport } from "../types/gradebook.types";
import type {
	CreateHomeworkInput,
	HomeworkAssignment,
	HomeworkDetail,
	UpdateHomeworkInput,
} from "../types/homework.types";
import type {
	BulkUpdateSubmissionsInput,
	HomeworkSubmissionsResponse,
} from "../types/homework-submissions.types";
import type {
	AttendanceReport,
	GradesReport,
	HomeworkReport,
	ReportOverview,
	ReportTerm,
} from "../types/report.types";

export const homeworkService = {
	list: (
		accessToken: string,
		tenantId: string,
		params?: { sectionSubjectId?: string; status?: string; studentId?: string },
	) => {
		const search = new URLSearchParams();
		if (params?.sectionSubjectId) search.set("sectionSubjectId", params.sectionSubjectId);
		if (params?.status) search.set("status", params.status);
		if (params?.studentId) search.set("studentId", params.studentId);
		const query = search.toString();
		return apiClient.get<{ assignments: HomeworkAssignment[] }>(
			`/tenants/${tenantId}/homework${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
	getById: (accessToken: string, tenantId: string, homeworkId: string) =>
		apiClient.get<{ assignment: HomeworkDetail }>(`/tenants/${tenantId}/homework/${homeworkId}`, {
			accessToken,
		}),
	create: (accessToken: string, tenantId: string, input: CreateHomeworkInput) =>
		apiClient.post<{ assignment: HomeworkDetail }>(`/tenants/${tenantId}/homework`, input, {
			accessToken,
		}),
	update: (accessToken: string, tenantId: string, homeworkId: string, input: UpdateHomeworkInput) =>
		apiClient.patch<{ assignment: HomeworkDetail }>(
			`/tenants/${tenantId}/homework/${homeworkId}`,
			input,
			{ accessToken },
		),
	listSubmissions: (accessToken: string, tenantId: string, homeworkId: string) =>
		apiClient.get<HomeworkSubmissionsResponse>(
			`/tenants/${tenantId}/homework/${homeworkId}/submissions`,
			{ accessToken },
		),
	bulkUpdateSubmissions: (
		accessToken: string,
		tenantId: string,
		homeworkId: string,
		input: BulkUpdateSubmissionsInput,
	) =>
		apiClient.put<HomeworkSubmissionsResponse>(
			`/tenants/${tenantId}/homework/${homeworkId}/submissions`,
			input,
			{ accessToken },
		),
};

export const assessmentService = {
	list: (
		accessToken: string,
		tenantId: string,
		params?: { sectionSubjectId?: string; status?: string },
	) => {
		const search = new URLSearchParams();
		if (params?.sectionSubjectId) search.set("sectionSubjectId", params.sectionSubjectId);
		if (params?.status) search.set("status", params.status);
		const query = search.toString();
		return apiClient.get<{ assessments: Assessment[] }>(
			`/tenants/${tenantId}/assessments${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
	planner: (
		accessToken: string,
		tenantId: string,
		params: { from: string; to: string; sectionSubjectId?: string },
	) => {
		const search = new URLSearchParams({ from: params.from, to: params.to });
		if (params.sectionSubjectId) search.set("sectionSubjectId", params.sectionSubjectId);
		return apiClient.get<{ assessments: Assessment[] }>(
			`/tenants/${tenantId}/assessments/planner?${search.toString()}`,
			{ accessToken },
		);
	},
	getById: (accessToken: string, tenantId: string, assessmentId: string) =>
		apiClient.get<{ assessment: AssessmentDetail }>(
			`/tenants/${tenantId}/assessments/${assessmentId}`,
			{ accessToken },
		),
	create: (accessToken: string, tenantId: string, input: CreateAssessmentInput) =>
		apiClient.post<{ assessment: AssessmentDetail }>(`/tenants/${tenantId}/assessments`, input, {
			accessToken,
		}),
	update: (
		accessToken: string,
		tenantId: string,
		assessmentId: string,
		input: UpdateAssessmentInput,
	) =>
		apiClient.patch<{ assessment: AssessmentDetail }>(
			`/tenants/${tenantId}/assessments/${assessmentId}`,
			input,
			{ accessToken },
		),
	upsertResults: (
		accessToken: string,
		tenantId: string,
		assessmentId: string,
		input: UpsertAssessmentResultsInput,
	) =>
		apiClient.put<{ assessment: AssessmentDetail }>(
			`/tenants/${tenantId}/assessments/${assessmentId}/results`,
			input,
			{ accessToken },
		),
};

export const attendanceService = {
	getOrCreateSession: (
		accessToken: string,
		tenantId: string,
		input: CreateAttendanceSessionInput,
	) =>
		apiClient.post<AttendanceSessionView>(`/tenants/${tenantId}/attendance/sessions`, input, {
			accessToken,
		}),
	markAttendance: (
		accessToken: string,
		tenantId: string,
		sessionId: string,
		input: MarkAttendanceInput,
	) =>
		apiClient.post<{
			marks: AttendanceSessionView["marks"];
			summary: AttendanceSessionView["summary"];
		}>(`/tenants/${tenantId}/attendance/sessions/${sessionId}/marks`, input, { accessToken }),
	confirmAllPresent: (
		accessToken: string,
		tenantId: string,
		sessionId: string,
		input: ConfirmAllPresentInput = {},
	) =>
		apiClient.post<AttendanceSessionView>(
			`/tenants/${tenantId}/attendance/sessions/${sessionId}/confirm-all-present`,
			input,
			{ accessToken },
		),
	getStudentHistory: (accessToken: string, tenantId: string, studentId: string) =>
		apiClient.get<{ history: StudentAttendanceHistoryEntry[] }>(
			`/tenants/${tenantId}/attendance/students/${studentId}/history`,
			{ accessToken },
		),
};

export const gradebookService = {
	grid: (
		accessToken: string,
		tenantId: string,
		params: { sectionId: string; term: GradebookTerm; subjectId?: string },
	) => {
		const search = new URLSearchParams({
			sectionId: params.sectionId,
			term: params.term,
		});
		if (params.subjectId) search.set("subjectId", params.subjectId);
		return apiClient.get<GradebookGrid>(`/tenants/${tenantId}/gradebook?${search.toString()}`, {
			accessToken,
		});
	},
	studentReport: (
		accessToken: string,
		tenantId: string,
		studentId: string,
		term?: GradebookTerm,
	) => {
		const search = new URLSearchParams();
		if (term) search.set("term", term);
		const query = search.toString();
		return apiClient.get<StudentReport>(
			`/tenants/${tenantId}/gradebook/student/${studentId}${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
};

export const reportService = {
	overview: (accessToken: string, tenantId: string, params?: { sectionId?: string }) => {
		const search = new URLSearchParams();
		if (params?.sectionId) search.set("sectionId", params.sectionId);
		const query = search.toString();
		return apiClient.get<ReportOverview>(
			`/tenants/${tenantId}/reports/overview${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
	grades: (
		accessToken: string,
		tenantId: string,
		params: { sectionId: string; term?: ReportTerm },
	) => {
		const search = new URLSearchParams({ sectionId: params.sectionId });
		if (params.term) search.set("term", params.term);
		return apiClient.get<GradesReport>(`/tenants/${tenantId}/reports/grades?${search.toString()}`, {
			accessToken,
		});
	},
	attendance: (
		accessToken: string,
		tenantId: string,
		params: { sectionId: string; from?: string; to?: string },
	) => {
		const search = new URLSearchParams({ sectionId: params.sectionId });
		if (params.from) search.set("from", params.from);
		if (params.to) search.set("to", params.to);
		return apiClient.get<AttendanceReport>(
			`/tenants/${tenantId}/reports/attendance?${search.toString()}`,
			{ accessToken },
		);
	},
	homework: (accessToken: string, tenantId: string, params: { sectionId: string }) => {
		const search = new URLSearchParams({ sectionId: params.sectionId });
		return apiClient.get<HomeworkReport>(
			`/tenants/${tenantId}/reports/homework?${search.toString()}`,
			{ accessToken },
		);
	},
};
