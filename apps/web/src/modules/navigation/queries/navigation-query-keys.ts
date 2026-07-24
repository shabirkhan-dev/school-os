export const navigationQueryKeys = {
	root: ["navigation"] as const,
	admin: (tenantId: string) => [...navigationQueryKeys.root, "admin", tenantId] as const,
};
