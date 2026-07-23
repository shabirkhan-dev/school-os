export { StudentsPage } from "./components/students-page";
export {
	useCreateEnrollmentMutation,
	useCreateStudentMutation,
	useStudentEnrollmentsQuery,
	useStudentsQuery,
} from "./hooks/use-student-queries";
export type {
	CreateEnrollmentInput,
	CreateStudentInput,
	Enrollment,
	Student,
} from "./types/student.types";
