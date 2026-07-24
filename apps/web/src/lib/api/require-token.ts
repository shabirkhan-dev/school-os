export function requireToken(token: string | null): string {
	if (!token) throw new Error("Not authenticated");
	return token;
}
