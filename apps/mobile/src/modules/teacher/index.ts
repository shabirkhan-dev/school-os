export {
	useBulkUpdateSubmissionsMutation,
	useConfirmAllPresentMutation,
	useCreateAssessmentMutation,
	useCreateHomeworkMutation,
	useGetOrCreateAttendanceSessionMutation,
	useMarkAttendanceMutation,
	useUpdateAssessmentMutation,
	useUpdateHomeworkMutation,
	useUpsertAssessmentResultsMutation,
} from "./hooks/use-teacher-mutations";
export {
	useAssessmentDetailQuery,
	useAssessmentListQuery,
	useAssessmentPlannerQuery,
	useAttendanceReportQuery,
	useGradebookQuery,
	useGradesReportQuery,
	useHomeworkDetailQuery,
	useHomeworkListQuery,
	useHomeworkReportQuery,
	useHomeworkSubmissionsQuery,
	useReportOverviewQuery,
	useSectionStudentsQuery,
	useStudentAttendanceHistoryQuery,
	useStudentReportQuery,
	useTeacherProfileQuery,
} from "./hooks/use-teacher-queries";
export {
	assessmentService,
	attendanceService,
	gradebookService,
	homeworkService,
	reportService,
} from "./services/teacher.service";
export type * from "./types/assessment.types";
export type * from "./types/attendance.types";
export type * from "./types/gradebook.types";
export type * from "./types/homework.types";
export type * from "./types/homework-submissions.types";
export type * from "./types/report.types";
