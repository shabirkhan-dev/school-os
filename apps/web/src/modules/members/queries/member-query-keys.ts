export const memberQueryKeys = {
	all: ["members"] as const,
	list: (tenantId: string) => [...memberQueryKeys.all, tenantId, "list"] as const,
	pendingInvites: () => [...memberQueryKeys.all, "pending-invites"] as const,
};
