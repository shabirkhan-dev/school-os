import { apiClient } from "@/lib/api/client";
import type {
	CreateEnrollmentInput,
	CreateStudentInput,
	Enrollment,
	Student,
	StudentDetail,
} from "../types/student.types";

export const studentsService = {
	list: (accessToken: string, tenantId: string, params?: { campusId?: string }) => {
		const search = new URLSearchParams();
		if (params?.campusId) search.set("campusId", params.campusId);
		const query = search.toString();
		return apiClient.get<{ students: Student[] }>(
			`/tenants/${tenantId}/students${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
	get: (accessToken: string, tenantId: string, studentId: string) =>
		apiClient.get<StudentDetail>(`/tenants/${tenantId}/students/${studentId}`, { accessToken }),
	create: (accessToken: string, tenantId: string, input: CreateStudentInput) =>
		apiClient.post<{ student: Student }>(`/tenants/${tenantId}/students`, input, {
			accessToken,
		}),
	listEnrollments: (
		accessToken: string,
		tenantId: string,
		params?: { studentId?: string; sectionId?: string },
	) => {
		if (params?.studentId) {
			return apiClient.get<{ enrollments: Enrollment[] }>(
				`/tenants/${tenantId}/students/${params.studentId}/enrollments`,
				{ accessToken },
			);
		}
		const search = new URLSearchParams();
		if (params?.sectionId) search.set("sectionId", params.sectionId);
		const query = search.toString();
		return apiClient.get<{ enrollments: Enrollment[] }>(
			`/tenants/${tenantId}/enrollments${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
	createEnrollment: (
		accessToken: string,
		tenantId: string,
		studentId: string,
		input: CreateEnrollmentInput,
	) =>
		apiClient.post<{ enrollment: Enrollment }>(
			`/tenants/${tenantId}/students/${studentId}/enrollments`,
			input,
			{ accessToken },
		),
};
