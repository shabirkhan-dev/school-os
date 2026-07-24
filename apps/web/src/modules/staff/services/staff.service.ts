import { apiClient } from "@/lib/api/client";
import type {
	AssignSectionSubjectInput,
	CreateSubjectInput,
	Subject,
	TeacherDashboard,
	TeacherDetail,
	TeacherProfile,
	TeacherSectionStudent,
	TeacherSummary,
	UpsertStaffProfileInput,
} from "../types/staff.types";

export const staffService = {
	listTeachers: (accessToken: string, tenantId: string) =>
		apiClient.get<{ teachers: TeacherSummary[] }>(`/tenants/${tenantId}/teachers`, {
			accessToken,
		}),
	getTeacher: (accessToken: string, tenantId: string, membershipId: string) =>
		apiClient.get<TeacherDetail>(`/tenants/${tenantId}/teachers/${membershipId}`, {
			accessToken,
		}),
	getMyTeacherProfile: (accessToken: string, tenantId: string) =>
		apiClient.get<TeacherDetail>(`/tenants/${tenantId}/teachers/me`, { accessToken }),
	getMyTeacherDashboard: (accessToken: string, tenantId: string, sessionDate: string) =>
		apiClient.get<TeacherDashboard>(
			`/tenants/${tenantId}/teachers/me/dashboard?sessionDate=${encodeURIComponent(sessionDate)}`,
			{ accessToken },
		),
	getMySectionStudents: (accessToken: string, tenantId: string, sectionId: string) =>
		apiClient.get<{ students: TeacherSectionStudent[] }>(
			`/tenants/${tenantId}/teachers/me/sections/${sectionId}/students`,
			{ accessToken },
		),
	upsertMyProfile: (accessToken: string, tenantId: string, input: UpsertStaffProfileInput) =>
		apiClient.patch<{ profile: TeacherProfile }>(
			`/tenants/${tenantId}/teachers/me/profile`,
			input,
			{ accessToken },
		),
	upsertProfile: (
		accessToken: string,
		tenantId: string,
		membershipId: string,
		input: UpsertStaffProfileInput,
	) =>
		apiClient.patch<{ profile: TeacherProfile }>(
			`/tenants/${tenantId}/teachers/${membershipId}/profile`,
			input,
			{ accessToken },
		),
	listSubjects: (accessToken: string, tenantId: string) =>
		apiClient.get<{ subjects: Subject[] }>(`/tenants/${tenantId}/subjects`, { accessToken }),
	listSectionSubjects: (accessToken: string, tenantId: string, campusId?: string) => {
		const search = campusId ? `?campusId=${encodeURIComponent(campusId)}` : "";
		return apiClient.get<{
			sectionSubjects: Array<{
				id: string;
				sectionId: string;
				sectionName: string;
				subjectId: string;
				subjectCode: string;
				subjectName: string;
				teacherMembershipId: string | null;
			}>;
		}>(`/tenants/${tenantId}/section-subjects${search}`, { accessToken });
	},
	createSubject: (accessToken: string, tenantId: string, input: CreateSubjectInput) =>
		apiClient.post<{ subject: Subject }>(`/tenants/${tenantId}/subjects`, input, { accessToken }),
	assignSectionSubject: (accessToken: string, tenantId: string, input: AssignSectionSubjectInput) =>
		apiClient.post<{ assignment: { id: string } }>(`/tenants/${tenantId}/section-subjects`, input, {
			accessToken,
		}),
};
