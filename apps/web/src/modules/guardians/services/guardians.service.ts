import { apiClient } from "@/lib/api/client";
import type {
	CreateGuardianInput,
	Guardian,
	LinkedStudent,
	LinkStudentGuardianInput,
	UpdateGuardianInput,
} from "../types/guardian.types";

export const guardiansService = {
	listGuardians: (accessToken: string, tenantId: string) =>
		apiClient.get<{ guardians: Guardian[] }>(`/tenants/${tenantId}/guardians`, { accessToken }),
	createGuardian: (accessToken: string, tenantId: string, input: CreateGuardianInput) =>
		apiClient.post<{ guardian: Guardian }>(`/tenants/${tenantId}/guardians`, input, {
			accessToken,
		}),
	updateGuardian: (
		accessToken: string,
		tenantId: string,
		guardianId: string,
		input: UpdateGuardianInput,
	) =>
		apiClient.patch<{ guardian: Guardian }>(`/tenants/${tenantId}/guardians/${guardianId}`, input, {
			accessToken,
		}),
	linkStudentGuardian: (
		accessToken: string,
		tenantId: string,
		studentId: string,
		input: LinkStudentGuardianInput,
	) =>
		apiClient.post<{ link: unknown }>(
			`/tenants/${tenantId}/students/${studentId}/guardians`,
			input,
			{ accessToken },
		),
	getMyChildren: (accessToken: string, tenantId: string) =>
		apiClient.get<{ children: LinkedStudent[] }>(`/tenants/${tenantId}/guardians/me/children`, {
			accessToken,
		}),
};
