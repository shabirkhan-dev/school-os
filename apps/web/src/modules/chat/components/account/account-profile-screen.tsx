"use client";

import { Button } from "@school-os/ui/components/button";
import { Input } from "@school-os/ui/components/input";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
import { userInitials } from "@/lib/user-display";
import { AccountPanel, AccountRow } from "@/modules/chat/components/account/account-panel";
import { useUpdateUserProfileMutation } from "@/modules/users/hooks/use-user-mutations";

export function AccountProfileScreen() {
	const { user } = useAuth();
	const updateProfile = useUpdateUserProfileMutation();
	const [username, setUsername] = useState("");
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (user) {
			setUsername(user.username);
		}
	}, [user]);

	if (!user) {
		return null;
	}

	const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	async function handleSave(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setMessage(null);
		setSubmitting(true);
		try {
			await updateProfile.mutateAsync({ username });
			setMessage("Profile updated.");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not update profile");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<main className="account-screen">
			<section className="account-screen__inner">
				<header className="account-hero">
					<span className="account-hero__avatar" aria-hidden="true">
						{userInitials(user.username)}
					</span>
					<div className="account-hero__meta">
						<h1>{user.username}</h1>
						<p>{user.email}</p>
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

				<AccountPanel title="Profile details" description="Your account identity and status.">
					<AccountRow label="Username" value={user.username} />
					<AccountRow label="Email" value={user.email} />
					<AccountRow
						label="Email status"
						value={user.emailVerified ? "Verified" : "Not verified"}
					/>
					<AccountRow label="Account" value={user.isActive ? "Active" : "Inactive"} />
					<AccountRow label="Member since" value={memberSince} />
				</AccountPanel>

				<AccountPanel
					title="Edit username"
					description="Usernames are unique and shown across School OS."
				>
					<form className="account-form" onSubmit={handleSave}>
						<label className="account-field" htmlFor="chat-profile-username">
							<span>Username</span>
							<Input
								id="chat-profile-username"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
								minLength={3}
								maxLength={64}
								pattern="^[a-zA-Z0-9._-]+$"
								autoComplete="username"
								required
							/>
							<small>3–64 characters. Letters, numbers, dots, underscores, and hyphens only.</small>
						</label>
						<Button
							className="account-button"
							type="submit"
							disabled={submitting || username === user.username}
						>
							{submitting ? "Saving…" : "Save changes"}
						</Button>
					</form>
				</AccountPanel>

				<AccountPanel
					title="Security"
					description="Manage your password and signed-in devices."
					action={
						<Link className="account-link-button" href="/chat/account/security">
							Open security
						</Link>
					}
				>
					<p className="account-panel__note">
						Password changes and session revocation live on the account security page.
					</p>
				</AccountPanel>
			</section>
		</main>
	);
}
