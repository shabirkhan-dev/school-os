"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/context/auth-context";
import { attendanceQueryKeys } from "../queries/attendance-query-keys";
import { attendanceService } from "../services/attendance.service";
import type {
	AttendanceSessionView,
	CreateAttendanceSessionInput,
	MarkAttendanceInput,
} from "../types/attendance.types";

function requireToken(token: string | null): string {
	if (!token) throw new Error("Authentication required");
	return token;
}

export function useAttendanceSessionQuery(
	tenantId: string | null,
	sectionId: string | null,
	sessionDate: string | null,
	enabled = true,
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: attendanceQueryKeys.session(tenantId ?? "", sectionId ?? "", sessionDate ?? ""),
		queryFn: () => {
			if (!tenantId || !sectionId || !sessionDate) {
				throw new Error("Tenant, section, and session date required");
			}
			return attendanceService
				.findSession(requireToken(token), tenantId, { sectionId, sessionDate })
				.then((response) => response);
		},
		enabled: enabled && Boolean(token && tenantId && sectionId && sessionDate),
		retry: false,
	});
}

export function useGetOrCreateSessionMutation(tenantId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateAttendanceSessionInput) =>
			attendanceService.getOrCreateSession(requireToken(token), tenantId, input),
		onSuccess: async (data, input) => {
			queryClient.setQueryData<AttendanceSessionView>(
				attendanceQueryKeys.session(tenantId, input.sectionId, input.sessionDate),
				data,
			);
		},
	});
}

export function useMarkAttendanceMutation(tenantId: string, sessionId: string) {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: MarkAttendanceInput) =>
			attendanceService.markAttendance(requireToken(token), tenantId, sessionId, input),
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ["attendance", "session", tenantId] });
		},
	});
}
