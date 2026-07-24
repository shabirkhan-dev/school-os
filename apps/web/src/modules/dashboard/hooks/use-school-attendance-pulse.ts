"use client";

import { useQuery } from "@tanstack/react-query";
import { attendanceService } from "@/modules/attendance/services/attendance.service";
import { useAuth } from "@/modules/auth/context/auth-context";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useSchoolDayPulseQuery(tenantId: string | null, enabled = true) {
	const { token } = useAuth();
	const sessionDate = new Date().toISOString().slice(0, 10);

	return useQuery({
		queryKey: ["school-day-pulse", tenantId, sessionDate],
		queryFn: () =>
			attendanceService.getSchoolDayPulse(requireToken(token), tenantId as string, sessionDate),
		enabled: enabled && Boolean(token && tenantId),
		staleTime: 60_000,
	});
}
