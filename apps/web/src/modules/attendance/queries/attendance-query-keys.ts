export const attendanceQueryKeys = {
	session: (tenantId: string, sectionId: string, sessionDate: string) =>
		["attendance", "session", tenantId, sectionId, sessionDate] as const,
};
