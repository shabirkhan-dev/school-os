export { MyClassesPage } from "./components/my-classes-page";
export { SubjectsPage } from "./components/subjects-page";
export { TeacherDetailPage } from "./components/teacher-detail-page";
export { TeachersPage } from "./components/teachers-page";
export {
	useAssignSectionSubjectMutation,
	useCreateSubjectMutation,
	useMyTeacherProfileQuery,
	useSubjectsQuery,
	useTeacherQuery,
	useTeachersQuery,
	useUpsertTeacherProfileMutation,
} from "./hooks/use-staff-queries";
export type * from "./types/staff.types";
