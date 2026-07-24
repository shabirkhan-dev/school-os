"use client";

import { AlertCircleIcon, FingerPrintIcon, MailSend01Icon } from "@hugeicons/core-free-icons";
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
import { FieldDescription } from "@school-os/ui/components/field";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { readInviteTokenFromSearchParams } from "@/modules/auth/lib/dev-auth-code";
import { useAuth } from "../context/auth-context";
import {
	useGoogleLoginMutation,
	useLoginMutation,
	useMagicLinkRequestMutation,
	usePasskeyLoginMutation,
	useTwoFactorMutation,
} from "../hooks/use-auth-mutations";
import { useAuthProvidersQuery } from "../hooks/use-auth-queries";
import { loginSchema } from "../schemas/auth.schemas";
import type { TwoFactorChallenge } from "../types/auth.types";
import { GoogleIdentityButton } from "./google-identity-button";
import { LoginCredentialsForm } from "./presentation/login-credentials-form";
import { TwoFactorForm } from "./presentation/two-factor-form";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const inviteToken = readInviteTokenFromSearchParams(searchParams);
	const { user, loading, error, clearError } = useAuth();
	const providers = useAuthProvidersQuery();
	const login = useLoginMutation();
	const twoFactor = useTwoFactorMutation();
	const passkey = usePasskeyLoginMutation();
	const magicLink = useMagicLinkRequestMutation();
	const google = useGoogleLoginMutation();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
	const [code, setCode] = useState("");
	const [notice, setNotice] = useState<string | null>(null);

	useEffect(() => {
		if (!loading && user) {
			router.replace(
				inviteToken ? `/accept-invite?token=${encodeURIComponent(inviteToken)}` : "/admin",
			);
		}
	}, [inviteToken, loading, router, user]);

	const finish = useCallback(() => {
		if (inviteToken) {
			router.push(`/accept-invite?token=${encodeURIComponent(inviteToken)}`);
			return;
		}
		router.push("/admin");
	}, [inviteToken, router]);
	const handleGoogle = useCallback(
		(credential: string) => google.mutate(credential, { onSuccess: finish }),
		[finish, google],
	);

	if (loading || user) return <div className="min-h-48" aria-busy="true" />;

	const currentError =
		error ??
		(login.error instanceof Error ? login.error.message : null) ??
		(twoFactor.error instanceof Error ? twoFactor.error.message : null) ??
		(passkey.error instanceof Error ? passkey.error.message : null) ??
		(magicLink.error instanceof Error ? magicLink.error.message : null) ??
		(google.error instanceof Error ? google.error.message : null);

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface ring-0">
				<CardHeader className="text-center">
					<p className="text-muted-foreground text-sm font-medium">Starter</p>
					<CardTitle className="text-2xl">
						{challenge ? "Two-factor verification" : "Welcome back"}
					</CardTitle>
					<CardDescription>
						{challenge ? "Complete the second step to continue" : "Choose a secure sign-in method"}
					</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4">
					{currentError ? (
						<Alert variant="destructive">
							<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
							<AlertTitle>Could not sign in</AlertTitle>
							<AlertDescription>{currentError}</AlertDescription>
						</Alert>
					) : null}
					{notice ? (
						<Alert>
							<AlertDescription>{notice}</AlertDescription>
						</Alert>
					) : null}

					{challenge ? (
						<TwoFactorForm
							code={code}
							pending={twoFactor.isPending}
							onCodeChange={setCode}
							onCancel={() => {
								setChallenge(null);
								setCode("");
								clearError();
							}}
							onSubmit={(event) => {
								event.preventDefault();
								twoFactor.mutate(
									{ challengeToken: challenge.challengeToken, code },
									{ onSuccess: finish },
								);
							}}
						/>
					) : (
						<>
							<LoginCredentialsForm
								email={email}
								password={password}
								showPassword={showPassword}
								pending={login.isPending}
								onEmailChange={setEmail}
								onPasswordChange={setPassword}
								onTogglePassword={() => setShowPassword((value) => !value)}
								onSubmit={(event) => {
									event.preventDefault();
									clearError();
									const result = loginSchema.safeParse({ email, password });
									if (!result.success) {
										setNotice(result.error.issues[0]?.message ?? "Invalid input");
										return;
									}
									login.mutate(result.data, {
										onSuccess: (loginResult) => {
											if ("requiresTwoFactor" in loginResult) setChallenge(loginResult);
											else finish();
										},
									});
								}}
							/>
							<div className="grid gap-2 border-t pt-4">
								<Button
									variant="outline"
									onClick={() => passkey.mutate(email.trim() || undefined, { onSuccess: finish })}
									disabled={passkey.isPending}
								>
									<HugeiconsIcon icon={FingerPrintIcon} strokeWidth={2} />
									Sign in with a passkey
								</Button>
								<Button
									variant="outline"
									onClick={() =>
										magicLink.mutate(email, { onSuccess: (result) => setNotice(result.message) })
									}
									disabled={!email || magicLink.isPending}
								>
									<HugeiconsIcon icon={MailSend01Icon} strokeWidth={2} />
									Email me a magic link
								</Button>
								{providers.data?.google.enabled ? (
									<GoogleIdentityButton onCredential={handleGoogle} disabled={google.isPending} />
								) : null}
							</div>
							<FieldDescription className="text-center">
								Don&apos;t have an account?{" "}
								<Link
									href={
										inviteToken
											? `/register?invite=${encodeURIComponent(inviteToken)}`
											: "/register"
									}
									className="text-primary underline"
								>
									Create one
								</Link>
							</FieldDescription>
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
