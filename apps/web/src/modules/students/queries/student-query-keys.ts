export const studentQueryKeys = {
	all: ["students"] as const,
	list: (tenantId: string, campusId: string | null) =>
		[...studentQueryKeys.all, tenantId, "list", campusId ?? "all"] as const,
	enrollments: (tenantId: string, studentId: string) =>
		[...studentQueryKeys.all, tenantId, "enrollments", studentId] as const,
};
