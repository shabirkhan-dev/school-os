export const tenantQueryKeys = {
	all: ["tenants"] as const,
	list: () => [...tenantQueryKeys.all, "list"] as const,
	detail: (tenantId: string) => [...tenantQueryKeys.all, "detail", tenantId] as const,
	campuses: (tenantId: string) => [...tenantQueryKeys.all, "campuses", tenantId] as const,
};
