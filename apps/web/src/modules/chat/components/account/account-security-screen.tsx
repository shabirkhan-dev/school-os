"use client";

import { Button } from "@school-os/ui/components/button";
import { Input } from "@school-os/ui/components/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
import * as api from "@/lib/api-client";
import type { SessionInfo } from "@/lib/auth-types";
import { userInitials } from "@/lib/user-display";
import { AccountPanel } from "@/modules/chat/components/account/account-panel";

export function AccountSecurityScreen() {
	const router = useRouter();
	const { token, user, logout, logoutAll } = useAuth();
	const [sessions, setSessions] = useState<SessionInfo[]>([]);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const loadSessions = useCallback(async () => {
		if (token) {
			setSessions(await api.listSessions(token));
		}
	}, [token]);

	useEffect(() => {
		loadSessions().catch((caught) => {
			setError(caught instanceof Error ? caught.message : "Could not load sessions");
		});
	}, [loadSessions]);

	if (!user) {
		return null;
	}

	async function handlePasswordChange(event: React.FormEvent) {
		event.preventDefault();
		if (!token) {
			return;
		}
		setError(null);
		setMessage(null);
		setSubmitting(true);
		try {
			const result = await api.changePassword(token, { currentPassword, newPassword });
			setCurrentPassword("");
			setNewPassword("");
			setMessage(result.message);
			await loadSessions();
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Password change failed");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleRevoke(session: SessionInfo) {
		if (!token) {
			return;
		}
		await api.revokeSession(token, session.id);
		if (session.isCurrent) {
			await logout();
			router.push("/login");
			return;
		}
		await loadSessions();
	}

	return (
		<main className="account-screen">
			<section className="account-screen__inner">
				<header className="account-hero">
					<span className="account-hero__avatar" aria-hidden="true">
						{userInitials(user.username)}
					</span>
					<div className="account-hero__meta">
						<h1>Account security</h1>
						<p>
							{user.username} · {user.email}
						</p>
						<Link className="account-text-link" href="/chat/account/profile">
							View profile
						</Link>
					</div>
				</header>

				{error ? (
					<div className="account-alert account-alert--error" role="alert">
						<strong>Something went wrong</strong>
						<span>{error}</span>
					</div>
				) : null}
				{message ? (
					<div className="account-alert" role="status">
						<strong>Updated</strong>
						<span>{message}</span>
					</div>
				) : null}

				<AccountPanel
					title="Change password"
					description="Other sessions will be signed out after the change."
				>
					<form className="account-form" onSubmit={handlePasswordChange}>
						<label className="account-field" htmlFor="chat-current-password">
							<span>Current password</span>
							<Input
								id="chat-current-password"
								type="password"
								value={currentPassword}
								onChange={(event) => setCurrentPassword(event.target.value)}
								autoComplete="current-password"
								required
							/>
						</label>
						<label className="account-field" htmlFor="chat-new-password">
							<span>New password</span>
							<Input
								id="chat-new-password"
								type="password"
								value={newPassword}
								onChange={(event) => setNewPassword(event.target.value)}
								minLength={12}
								maxLength={128}
								autoComplete="new-password"
								required
							/>
							<small>Use at least 12 characters.</small>
						</label>
						<Button className="account-button" type="submit" disabled={submitting}>
							{submitting ? "Updating…" : "Change password"}
						</Button>
					</form>
				</AccountPanel>

				<AccountPanel title="Active sessions" description="Revoke devices you no longer recognize.">
					<div className="account-session-list">
						{sessions.map((session) => (
							<div className="account-session" key={session.id}>
								<div className="account-session__meta">
									<p>
										{session.userAgent ?? "Unknown device"}
										{session.isCurrent ? " (current)" : ""}
									</p>
									<span>
										{session.ipAddress ?? "Unknown IP"} · Last used{" "}
										{new Date(session.lastUsedAt).toLocaleString()}
									</span>
								</div>
								<Button
									variant="ghost"
									className="account-button account-button--ghost"
									onClick={() => void handleRevoke(session)}
								>
									Revoke
								</Button>
							</div>
						))}
						<Button
							variant="destructive"
							className="account-button account-button--danger"
							onClick={async () => {
								await logoutAll();
								router.push("/login");
							}}
						>
							Sign out everywhere
						</Button>
					</div>
				</AccountPanel>
			</section>
		</main>
	);
}
