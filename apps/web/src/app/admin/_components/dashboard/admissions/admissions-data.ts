import type { DashboardAdmission } from "@/modules/dashboard";

export type {
	AdmissionSource,
	AdmissionStatus,
	DashboardAdmission,
	DashboardAdmission as Admission,
} from "@/modules/dashboard";

export function admissionSummary(rows: DashboardAdmission[]) {
	return {
		total: rows.length,
		pending: rows.filter((r) => r.status === "pending").length,
		waitlisted: rows.filter((r) => r.status === "waitlisted").length,
		enrolled: rows.filter((r) => r.status === "enrolled").length,
	};
}
