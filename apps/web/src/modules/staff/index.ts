export { ClassDetailPage } from "./components/class-detail-page";
export { MyClassesPage } from "./components/my-classes-page";
export { SubjectsPage } from "./components/subjects-page";
export { TeacherDetailPage } from "./components/teacher-detail-page";
export { TeacherProfilePage } from "./components/teacher-profile-page";
export { TeachersPage } from "./components/teachers-page";
export {
	useAssignSectionSubjectMutation,
	useCreateSubjectMutation,
	useMySectionStudentsQuery,
	useMyTeacherDashboardQuery,
	useMyTeacherProfileQuery,
	useSubjectsQuery,
	useTeacherQuery,
	useTeachersQuery,
	useUpsertMyTeacherProfileMutation,
	useUpsertTeacherProfileMutation,
} from "./hooks/use-staff-queries";
export type * from "./types/staff.types";
