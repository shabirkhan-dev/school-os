import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth";
import { staffService } from "../services/staff.service";

export function useMyTeacherDashboardQuery(
	tenantId: string | null,
	sessionDate: string,
	enabled = true,
) {
	const { token } = useAuth();

	return useQuery({
		queryKey: ["staff", tenantId, "me", "dashboard", sessionDate],
		queryFn: () => {
			if (!token || !tenantId) throw new Error("Teacher organization context is required");
			return staffService.getMyTeacherDashboard(token, tenantId, sessionDate);
		},
		enabled: enabled && Boolean(token && tenantId && sessionDate),
	});
}
