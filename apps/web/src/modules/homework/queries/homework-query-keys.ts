export const homeworkQueryKeys = {
	all: (tenantId: string) => ["homework", tenantId] as const,
	list: (tenantId: string, sectionSubjectId?: string, status?: string, studentId?: string) =>
		[
			"homework",
			tenantId,
			"list",
			sectionSubjectId ?? "all",
			status ?? "all",
			studentId ?? "all",
		] as const,
	detail: (tenantId: string, homeworkId: string) =>
		["homework", tenantId, "detail", homeworkId] as const,
};
