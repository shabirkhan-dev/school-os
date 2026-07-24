export const academicQueryKeys = {
	all: ["academic"] as const,
	years: (tenantId: string) => [...academicQueryKeys.all, "years", tenantId] as const,
	classes: (tenantId: string) => [...academicQueryKeys.all, "classes", tenantId] as const,
	sections: (tenantId: string, campusId?: string | null) =>
		[...academicQueryKeys.all, "sections", tenantId, campusId ?? "all"] as const,
};
