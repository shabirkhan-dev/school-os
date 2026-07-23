const DEV_CODE_PARAM = "devCode";

export function isDevAuthCodeEnabled(): boolean {
	return process.env.NODE_ENV === "development";
}

function isValidDevCode(code: string | undefined): code is string {
	return typeof code === "string" && /^\d{6}$/.test(code);
}

/** Pass dev OTP via URL in local development only (never persisted client-side). */
export function buildAuthRedirectUrl(
	path: string,
	email: string,
	devCode?: string,
	inviteToken?: string,
): string {
	const params = new URLSearchParams({ email });
	if (isDevAuthCodeEnabled() && isValidDevCode(devCode)) {
		params.set(DEV_CODE_PARAM, devCode);
	}
	if (inviteToken) {
		params.set("invite", inviteToken);
	}
	return `${path}?${params.toString()}`;
}

export function readInviteTokenFromSearchParams(searchParams: URLSearchParams): string | null {
	const token = searchParams.get("invite") ?? searchParams.get("token");
	return token && token.length >= 20 ? token : null;
}

export function readDevCodeFromSearchParams(searchParams: URLSearchParams): string | null {
	if (!isDevAuthCodeEnabled()) {
		return null;
	}
	const code = searchParams.get(DEV_CODE_PARAM);
	return isValidDevCode(code ?? undefined) ? code : null;
}
