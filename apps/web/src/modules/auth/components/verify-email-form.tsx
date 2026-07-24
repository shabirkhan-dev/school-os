"use client";

import { Alert, AlertDescription, AlertTitle } from "@school-os/ui/components/alert";
import { Button } from "@school-os/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@school-os/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import { Input } from "@school-os/ui/components/input";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	buildAuthRedirectUrl,
	readDevCodeFromSearchParams,
	readInviteTokenFromSearchParams,
} from "@/modules/auth/lib/dev-auth-code";
import { authService } from "@/modules/auth/services";

export function VerifyEmailForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const inviteToken = readInviteTokenFromSearchParams(searchParams);
	const [email, setEmail] = useState(searchParams.get("email") ?? "");
	const [code, setCode] = useState("");
	const [developmentCode, setDevelopmentCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [resending, setResending] = useState(false);

	useEffect(() => {
		setDevelopmentCode(readDevCodeFromSearchParams(searchParams));
	}, [searchParams]);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);
		try {
			await authService.verifyEmail({ email, code });
			const loginParams = new URLSearchParams({ verified: "true" });
			if (inviteToken) loginParams.set("invite", inviteToken);
			router.push(`/login?${loginParams.toString()}`);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Verification failed");
		} finally {
			setSubmitting(false);
		}
	}

	async function handleResend() {
		setError(null);
		setResending(true);
		try {
			const result = await authService.resendVerification(email);
			if (result.developmentCode) {
				setDevelopmentCode(result.developmentCode);
				router.replace(
					buildAuthRedirectUrl(
						"/verify-email",
						email,
						result.developmentCode,
						inviteToken ?? undefined,
					),
				);
			}
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not resend code");
		} finally {
			setResending(false);
		}
	}

	return (
		<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface ring-0">
			<CardHeader className="text-center">
				<CardTitle className="text-2xl">Verify your email</CardTitle>
				<CardDescription>Enter the six-digit code sent to your email address.</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={handleSubmit}>
					<FieldGroup>
						{developmentCode ? (
							<Alert>
								<AlertTitle>Development code</AlertTitle>
								<AlertDescription className="font-mono text-base">
									{developmentCode}
								</AlertDescription>
							</Alert>
						) : null}
						{error ? (
							<Alert variant="destructive">
								<AlertTitle>Could not verify email</AlertTitle>
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						) : null}
						<Field>
							<FieldLabel htmlFor="verification-email">Email</FieldLabel>
							<Input
								id="verification-email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								autoComplete="email"
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="verification-code">Verification code</FieldLabel>
							<Input
								id="verification-code"
								inputMode="numeric"
								pattern="[0-9]{6}"
								maxLength={6}
								value={code}
								onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
								autoComplete="one-time-code"
								required
							/>
						</Field>
						<Button type="submit" disabled={submitting}>
							{submitting ? <Spinner data-icon="inline-start" /> : null}
							Verify email
						</Button>
						<Button
							type="button"
							variant="outline"
							onClick={handleResend}
							disabled={!email || resending}
						>
							{resending ? "Sending..." : "Send a new code"}
						</Button>
						<p className="text-muted-foreground text-center text-sm">
							<Link
								href={inviteToken ? `/login?invite=${encodeURIComponent(inviteToken)}` : "/login"}
								className="underline underline-offset-4"
							>
								Back to sign in
							</Link>
						</p>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
