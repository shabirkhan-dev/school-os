export const studentQueryKeys = {
	all: ["students"] as const,
	list: (tenantId: string, campusId: string | null) =>
		[...studentQueryKeys.all, tenantId, "list", campusId ?? "all"] as const,
	detail: (tenantId: string, studentId: string) =>
		[...studentQueryKeys.all, tenantId, "detail", studentId] as const,
	enrollments: (tenantId: string, studentId: string) =>
		[...studentQueryKeys.all, tenantId, "enrollments", studentId] as const,
	tenantEnrollments: (tenantId: string, academicYearId: string) =>
		[...studentQueryKeys.all, tenantId, "tenant-enrollments", academicYearId] as const,
};
