"use client";

import {
	AlertCircleIcon,
	Building03Icon,
	Mail01Icon,
	Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert, AlertDescription, AlertTitle } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@school-os/ui/components/card";
import { Spinner } from "@school-os/ui/components/spinner";
import { useToast } from "@school-os/ui/components/toaster";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { authService, useAuth } from "@/modules/auth";
import {
	type InvitePreview,
	MemberRoleBadge,
	membersService,
	usePendingInvitesQuery,
} from "@/modules/members";
import { membershipRoleLabels } from "@/modules/tenants";

function AcceptInviteContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";
	const toast = useToast();
	const { user, loading, token: accessToken, establishSession } = useAuth();
	const pendingQuery = usePendingInvitesQuery(Boolean(user && !token));
	const [preview, setPreview] = useState<InvitePreview | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [accepted, setAccepted] = useState<{ tenantName: string } | null>(null);

	useEffect(() => {
		if (!token) return;
		membersService
			.previewInvite(token)
			.then((response) => setPreview(response.invite))
			.catch((error) =>
				setPreviewError(error instanceof Error ? error.message : "Invite not found or expired"),
			);
	}, [token]);

	async function completeAccept(input: { token?: string; inviteId?: string }) {
		if (!accessToken) return;
		setAcceptingId(input.inviteId ?? "token");
		try {
			const result = await membersService.acceptInvite(accessToken, input);
			const session = await authService.switchTenant(accessToken, result.tenant.id);
			establishSession(session);
			setAccepted({ tenantName: result.tenant.name });
			toast.show({
				title: `Welcome to ${result.tenant.name}`,
				description: `You are now ${membershipRoleLabels[result.membership.role]}.`,
				status: "success",
			});
			window.setTimeout(() => router.replace("/admin"), 1200);
		} catch (error) {
			toast.show({
				title: "Could not accept invite",
				description: error instanceof ApiError ? error.message : "Something went wrong",
				status: "error",
			});
		} finally {
			setAcceptingId(null);
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-48 items-center justify-center">
				<Spinner className="size-6 text-muted-foreground" />
			</div>
		);
	}

	if (!token && user) {
		const invites = pendingQuery.data?.invites ?? [];
		return (
			<Card className="border-dashboard-border bg-dashboard-surface shadow-sm">
				<CardHeader className="text-center">
					<div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-dashboard-accent-soft text-dashboard-accent">
						<HugeiconsIcon icon={Mail01Icon} size={22} strokeWidth={2} />
					</div>
					<CardTitle>Your organization invites</CardTitle>
					<CardDescription>Accept to join a school workspace on School OS.</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3">
					{pendingQuery.isLoading ? (
						<div className="flex justify-center py-6">
							<Spinner className="size-6 text-muted-foreground" />
						</div>
					) : invites.length === 0 ? (
						<Alert>
							<AlertDescription>
								No pending invites for {user.email}. Open the link from your invite email, or ask
								your admin to resend it.
							</AlertDescription>
						</Alert>
					) : (
						invites.map((invite) => (
							<div
								key={invite.inviteId}
								className="rounded-xl border border-dashboard-border bg-dashboard-surface-elevated p-4"
							>
								<div className="flex items-start gap-3">
									<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dashboard-surface-strong ring-1 ring-dashboard-border">
										<HugeiconsIcon icon={Building03Icon} size={18} strokeWidth={2} />
									</span>
									<div className="min-w-0 flex-1">
										<div className="font-semibold text-dashboard-text-primary">
											{invite.tenantName}
										</div>
										<div className="mt-1 flex flex-wrap items-center gap-2">
											<MemberRoleBadge role={invite.role} />
											<span className="text-[12px] text-dashboard-text-dim">{invite.email}</span>
										</div>
										<p className="mt-1 text-[11px] text-dashboard-text-dim tabular-nums">
											Expires {new Date(invite.expiresAt).toLocaleDateString()}
										</p>
									</div>
								</div>
								<Button
									className="mt-3 w-full bg-dashboard-accent text-dashboard-accent-fg hover:bg-dashboard-accent-hover"
									disabled={acceptingId !== null}
									onClick={() => void completeAccept({ inviteId: invite.inviteId })}
								>
									{acceptingId === invite.inviteId ? (
										<Spinner className="size-4" />
									) : (
										"Accept invite"
									)}
								</Button>
							</div>
						))
					)}
				</CardContent>
			</Card>
		);
	}

	if (!token) {
		return (
			<Alert variant="destructive">
				<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
				<AlertTitle>Invalid invite</AlertTitle>
				<AlertDescription>This invite link is missing a token.</AlertDescription>
			</Alert>
		);
	}

	if (!user) {
		const loginHref = `/login?invite=${encodeURIComponent(token)}`;
		const registerHref = `/register?invite=${encodeURIComponent(token)}`;
		return (
			<Card className="border-dashboard-border bg-dashboard-surface shadow-sm">
				<CardHeader className="text-center">
					<CardTitle>Sign in to accept</CardTitle>
					<CardDescription>
						{preview
							? `Join ${preview.tenantName} as ${membershipRoleLabels[preview.role]}`
							: "Use the email address that received the invite."}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3">
					{previewError ? (
						<Alert variant="destructive">
							<AlertDescription>{previewError}</AlertDescription>
						</Alert>
					) : null}
					<Button render={<Link href={loginHref} />} nativeButton={false}>
						Sign in
					</Button>
					<Button variant="outline" render={<Link href={registerHref} />} nativeButton={false}>
						Create account
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (accepted) {
		return (
			<Alert className="border-emerald-500/25 bg-emerald-500/10">
				<HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
				<AlertTitle>Welcome to {accepted.tenantName}</AlertTitle>
				<AlertDescription>Switching to your organization…</AlertDescription>
			</Alert>
		);
	}

	const emailMismatch =
		preview && user.email.toLowerCase() !== preview.email.toLowerCase() ? preview.email : null;

	return (
		<Card className="border-dashboard-border bg-dashboard-surface shadow-sm">
			<CardHeader className="text-center">
				<CardTitle>Accept organization invite</CardTitle>
				<CardDescription>Review the details below before joining.</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{previewError ? (
					<Alert variant="destructive">
						<AlertDescription>{previewError}</AlertDescription>
					</Alert>
				) : null}
				{emailMismatch ? (
					<Alert variant="destructive">
						<AlertDescription>
							Signed in as {user.email}, but this invite was sent to {emailMismatch}.
						</AlertDescription>
					</Alert>
				) : null}
				{preview ? (
					<div className="rounded-xl border border-dashboard-border bg-dashboard-surface-elevated p-4">
						<div className="flex items-start gap-3">
							<span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-dashboard-surface-strong ring-1 ring-dashboard-border">
								<HugeiconsIcon icon={Building03Icon} size={18} strokeWidth={2} />
							</span>
							<div>
								<div className="font-semibold text-dashboard-text-primary">
									{preview.tenantName}
								</div>
								<div className="mt-2 flex flex-wrap gap-2">
									<MemberRoleBadge role={preview.role} />
								</div>
								<div className="mt-2 text-[12px] text-dashboard-text-dim">{preview.email}</div>
								<div className="text-[11px] text-dashboard-text-dim tabular-nums">
									Expires {new Date(preview.expiresAt).toLocaleDateString()}
								</div>
							</div>
						</div>
					</div>
				) : (
					<div className="flex justify-center py-4">
						<Spinner className="size-6 text-muted-foreground" />
					</div>
				)}
				<Button
					className="w-full bg-dashboard-accent text-dashboard-accent-fg hover:bg-dashboard-accent-hover"
					disabled={
						!preview || acceptingId !== null || Boolean(previewError) || Boolean(emailMismatch)
					}
					onClick={() => void completeAccept({ token })}
				>
					{acceptingId ? <Spinner className="size-4" /> : "Accept & continue"}
				</Button>
			</CardContent>
		</Card>
	);
}

export default function AcceptInvitePage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-dashboard-bg p-6 md:p-10">
			<div className="w-full max-w-md">
				<Suspense
					fallback={
						<div className="flex min-h-48 items-center justify-center">
							<Spinner className="size-6 text-muted-foreground" />
						</div>
					}
				>
					<AcceptInviteContent />
				</Suspense>
			</div>
		</div>
	);
}
