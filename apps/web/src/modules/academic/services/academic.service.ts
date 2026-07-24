import { apiClient } from "@/lib/api/client";
import type {
	AcademicYear,
	CreateAcademicYearInput,
	CreateClassInput,
	CreateSectionInput,
	SchoolClass,
	Section,
	UpdateAcademicYearInput,
	UpdateClassInput,
	UpdateSectionInput,
} from "../types/academic.types";

export const academicService = {
	listYears: (accessToken: string, tenantId: string) =>
		apiClient.get<{ academicYears: AcademicYear[] }>(`/tenants/${tenantId}/academic-years`, {
			accessToken,
		}),
	createYear: (accessToken: string, tenantId: string, input: CreateAcademicYearInput) =>
		apiClient.post<{ academicYear: AcademicYear }>(`/tenants/${tenantId}/academic-years`, input, {
			accessToken,
		}),
	updateYear: (
		accessToken: string,
		tenantId: string,
		academicYearId: string,
		input: UpdateAcademicYearInput,
	) =>
		apiClient.patch<{ academicYear: AcademicYear }>(
			`/tenants/${tenantId}/academic-years/${academicYearId}`,
			input,
			{ accessToken },
		),
	deleteYear: (accessToken: string, tenantId: string, academicYearId: string) =>
		apiClient.delete<{ success: true }>(`/tenants/${tenantId}/academic-years/${academicYearId}`, {
			accessToken,
		}),
	listClasses: (accessToken: string, tenantId: string) =>
		apiClient.get<{ classes: SchoolClass[] }>(`/tenants/${tenantId}/classes`, { accessToken }),
	createClass: (accessToken: string, tenantId: string, input: CreateClassInput) =>
		apiClient.post<{ class: SchoolClass }>(`/tenants/${tenantId}/classes`, input, {
			accessToken,
		}),
	updateClass: (accessToken: string, tenantId: string, classId: string, input: UpdateClassInput) =>
		apiClient.patch<{ class: SchoolClass }>(`/tenants/${tenantId}/classes/${classId}`, input, {
			accessToken,
		}),
	deleteClass: (accessToken: string, tenantId: string, classId: string) =>
		apiClient.delete<{ success: true }>(`/tenants/${tenantId}/classes/${classId}`, {
			accessToken,
		}),
	listSections: (
		accessToken: string,
		tenantId: string,
		params?: { campusId?: string; academicYearId?: string },
	) => {
		const search = new URLSearchParams();
		if (params?.campusId) search.set("campusId", params.campusId);
		if (params?.academicYearId) search.set("academicYearId", params.academicYearId);
		const query = search.toString();
		return apiClient.get<{ sections: Section[] }>(
			`/tenants/${tenantId}/sections${query ? `?${query}` : ""}`,
			{ accessToken },
		);
	},
	createSection: (accessToken: string, tenantId: string, input: CreateSectionInput) =>
		apiClient.post<{ section: Section }>(`/tenants/${tenantId}/sections`, input, {
			accessToken,
		}),
	updateSection: (
		accessToken: string,
		tenantId: string,
		sectionId: string,
		input: UpdateSectionInput,
	) =>
		apiClient.patch<{ section: Section }>(`/tenants/${tenantId}/sections/${sectionId}`, input, {
			accessToken,
		}),
	deleteSection: (accessToken: string, tenantId: string, sectionId: string) =>
		apiClient.delete<{ success: true }>(`/tenants/${tenantId}/sections/${sectionId}`, {
			accessToken,
		}),
};
