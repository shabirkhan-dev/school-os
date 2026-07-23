type EmailTemplate = { subject: string; html: string };

export function verificationEmail(code: string): EmailTemplate {
	return codeEmail('Verify your email address', 'Verify your email', 'verification', code);
}

export function passwordResetEmail(code: string): EmailTemplate {
	return codeEmail('Reset your password', 'Reset your password', 'password reset', code);
}

export function magicLinkEmail(url: string): EmailTemplate {
	const safeUrl = escapeHtml(url);
	return {
		subject: 'Your secure sign-in link',
		html: layout(
			'Sign in to your account',
			`<p>Use the secure link below to sign in. It expires shortly and can only be used once.</p><p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#171717;color:#fff;text-decoration:none">Sign in securely</a></p><p style="font-size:12px;color:#737373;word-break:break-all">${safeUrl}</p>`,
		),
	};
}

export function membershipInviteEmail(input: {
	organizationName: string;
	role: string;
	acceptUrl: string;
}): EmailTemplate {
	const safeUrl = escapeHtml(input.acceptUrl);
	const org = escapeHtml(input.organizationName);
	const role = escapeHtml(input.role.replaceAll('_', ' '));
	return {
		subject: `You're invited to join ${input.organizationName} on School OS`,
		html: layout(
			`Join ${org}`,
			`<p>You have been invited to join <strong>${org}</strong> as <strong>${role}</strong>.</p><p><a href="${safeUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#171717;color:#fff;text-decoration:none">Accept invitation</a></p><p>If you do not yet have an account, create one with this email address first, then open the invite link again.</p><p style="font-size:12px;color:#737373;word-break:break-all">${safeUrl}</p>`,
		),
	};
}

function codeEmail(subject: string, heading: string, purpose: string, code: string): EmailTemplate {
	return {
		subject,
		html: layout(
			heading,
			`<p>Use this one-time code for ${purpose}:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${escapeHtml(code)}</p>`,
		),
	};
}

function layout(heading: string, content: string): string {
	return `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#171717"><h1>${escapeHtml(heading)}</h1>${content}<p>This request expires shortly. If you did not make it, you can ignore this email.</p></body></html>`;
}

function escapeHtml(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;',
		};
		return entities[character] ?? character;
	});
}
