export const assessmentsQueryKeys = {
	all: (tenantId: string) => ["assessments", tenantId] as const,
	list: (tenantId: string, sectionSubjectId?: string, status?: string) =>
		["assessments", tenantId, "list", sectionSubjectId ?? "all", status ?? "all"] as const,
	planner: (tenantId: string, from: string, to: string, sectionSubjectId?: string) =>
		["assessments", tenantId, "planner", from, to, sectionSubjectId ?? "all"] as const,
	detail: (tenantId: string, assessmentId: string) =>
		["assessments", tenantId, "detail", assessmentId] as const,
};
