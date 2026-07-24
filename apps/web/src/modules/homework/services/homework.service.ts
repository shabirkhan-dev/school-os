import { apiClient } from "@/lib/api/client";
import type {
	CreateHomeworkInput,
	HomeworkAssignment,
	HomeworkDetail,
	UpdateHomeworkInput,
} from "../types/homework.types";

export const homeworkService = {
	list: (
		accessToken: string,
		tenantId: string,
		params?: { sectionSubjectId?: string; status?: string },
	) => {
		const search = new URLSearchParams();
		if (params?.sectionSubjectId) search.set("sectionSubjectId", params.sectionSubjectId);
		if (params?.status) search.set("status", params.status);
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
};
