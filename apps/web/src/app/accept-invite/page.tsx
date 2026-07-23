"use client";

import { AlertCircleIcon, Tick02Icon } from "@hugeicons/core-free-icons";
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
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/modules/auth";
import { type InvitePreview, membersService } from "@/modules/members";
import { membershipRoleLabels } from "@/modules/tenants";

function AcceptInviteContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token") ?? "";
	const { user, loading, token: accessToken } = useAuth();
	const [preview, setPreview] = useState<InvitePreview | null>(null);
	const [previewError, setPreviewError] = useState<string | null>(null);
	const [acceptError, setAcceptError] = useState<string | null>(null);
	const [accepting, setAccepting] = useState(false);
	const [accepted, setAccepted] = useState<{ tenantName: string } | null>(null);

	useEffect(() => {
		if (!token) {
			setPreviewError("Invite link is missing or invalid.");
			return;
		}
		membersService
			.previewInvite(token)
			.then((response) => setPreview(response.invite))
			.catch((error) =>
				setPreviewError(error instanceof Error ? error.message : "Invite not found or expired"),
			);
	}, [token]);

	async function handleAccept() {
		if (!accessToken || !token) return;
		setAcceptError(null);
		setAccepting(true);
		try {
			const result = await membersService.acceptInvite(accessToken, token);
			setAccepted({ tenantName: result.tenant.name });
			window.setTimeout(() => router.replace("/admin"), 1500);
		} catch (error) {
			setAcceptError(error instanceof Error ? error.message : "Could not accept invite");
		} finally {
			setAccepting(false);
		}
	}

	if (loading) {
		return (
			<div className="flex min-h-48 items-center justify-center">
				<Spinner className="size-6 text-muted-foreground" />
			</div>
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
			<Card className="border-dashboard-border bg-dashboard-surface">
				<CardHeader className="text-center">
					<CardTitle>Sign in to accept your invite</CardTitle>
					<CardDescription>
						{preview
							? `Join ${preview.tenantName} as ${membershipRoleLabels[preview.role]}`
							: "Create an account or sign in with the invited email address."}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3">
					{previewError ? (
						<Alert variant="destructive">
							<AlertDescription>{previewError}</AlertDescription>
						</Alert>
					) : null}
					<Button render={<Link href={loginHref} />}>Sign in</Button>
					<Button variant="outline" render={<Link href={registerHref} />}>
						Create account
					</Button>
				</CardContent>
			</Card>
		);
	}

	if (accepted) {
		return (
			<Alert>
				<HugeiconsIcon icon={Tick02Icon} strokeWidth={2} />
				<AlertTitle>Welcome to {accepted.tenantName}</AlertTitle>
				<AlertDescription>Redirecting to your dashboard…</AlertDescription>
			</Alert>
		);
	}

	return (
		<Card className="border-dashboard-border bg-dashboard-surface">
			<CardHeader className="text-center">
				<CardTitle>Accept organization invite</CardTitle>
				<CardDescription>
					{preview
						? `You are joining ${preview.tenantName} as ${membershipRoleLabels[preview.role]}`
						: "Review and accept your invitation"}
				</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-4">
				{previewError ? (
					<Alert variant="destructive">
						<AlertDescription>{previewError}</AlertDescription>
					</Alert>
				) : null}
				{acceptError ? (
					<Alert variant="destructive">
						<AlertDescription>{acceptError}</AlertDescription>
					</Alert>
				) : null}
				{preview ? (
					<div className="rounded-lg border border-dashboard-border bg-dashboard-surface-elevated p-4 text-sm">
						<div className="font-medium text-dashboard-text-secondary">{preview.tenantName}</div>
						<div className="text-dashboard-text-dim">
							Role: {membershipRoleLabels[preview.role]}
						</div>
						<div className="text-dashboard-text-dim">Email: {preview.email}</div>
					</div>
				) : (
					<div className="flex justify-center py-4">
						<Spinner className="size-6 text-muted-foreground" />
					</div>
				)}
				<Button
					disabled={!preview || accepting || Boolean(previewError)}
					onClick={() => void handleAccept()}
				>
					{accepting ? <Spinner className="size-4" /> : "Accept invite"}
				</Button>
			</CardContent>
		</Card>
	);
}

export default function AcceptInvitePage() {
	return (
		<div className="flex min-h-svh flex-col items-center justify-center bg-dashboard-bg p-6 md:p-10">
			<div className="w-full max-w-sm md:max-w-md">
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
