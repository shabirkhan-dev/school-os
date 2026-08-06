/**
 * Format a role slug from the API into a human-readable label.
 * Example: "school_admin" → "School Admin"
 */
export function formatRoleLabel(role?: string): string {
	if (!role) return "School OS";
	return role
		.split("_")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}
