import { apiClient } from "@/lib/api/client";
import type {
	AcademicYear,
	CreateAcademicYearInput,
	CreateClassInput,
	CreateSectionInput,
	SchoolClass,
	Section,
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
	listClasses: (accessToken: string, tenantId: string) =>
		apiClient.get<{ classes: SchoolClass[] }>(`/tenants/${tenantId}/classes`, { accessToken }),
	createClass: (accessToken: string, tenantId: string, input: CreateClassInput) =>
		apiClient.post<{ class: SchoolClass }>(`/tenants/${tenantId}/classes`, input, {
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
};
