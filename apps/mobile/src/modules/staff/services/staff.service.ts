import { apiClient } from "@/lib/api/client";
import type { TeacherDashboard, TeacherDetail, TeacherSectionStudent } from "../types/staff.types";

export const staffService = {
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
};
