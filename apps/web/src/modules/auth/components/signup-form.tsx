"use client";

import {
	AlertCircleIcon,
	Mail01Icon,
	UserCircleIcon,
	ViewIcon,
	ViewOffSlashIcon,
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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@school-os/ui/components/field";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@school-os/ui/components/input-group";
import { Spinner } from "@school-os/ui/components/spinner";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
	buildAuthRedirectUrl,
	readInviteTokenFromSearchParams,
} from "@/modules/auth/lib/dev-auth-code";

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const inviteToken = readInviteTokenFromSearchParams(searchParams);
	const { user, loading, error, clearError, register } = useAuth();
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [localError, setLocalError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

	useEffect(() => {
		if (!loading && user) {
			router.replace(
				inviteToken ? `/accept-invite?token=${encodeURIComponent(inviteToken)}` : "/admin",
			);
		}
	}, [inviteToken, loading, router, user]);

	if (loading || user) {
		return (
			<div className="flex min-h-48 items-center justify-center" aria-busy="true">
				<Spinner className="size-6 text-muted-foreground" />
			</div>
		);
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		clearError();
		setLocalError(null);

		if (password.length < 12) {
			setLocalError("Password must be at least 12 characters.");
			return;
		}
		if (password !== confirmPassword) {
			setLocalError("Passwords do not match.");
			return;
		}

		setSubmitting(true);
		try {
			const result = await register({ email, username, password });
			router.push(
				buildAuthRedirectUrl(
					"/verify-email",
					email,
					result.developmentCode,
					inviteToken ?? undefined,
				),
			);
		} catch {
			// error set in context
		} finally {
			setSubmitting(false);
		}
	}

	const displayError = localError ?? error;

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="rounded-[16px] border border-dashboard-border bg-dashboard-surface ring-0">
				<CardHeader className="text-center">
					<p className="text-muted-foreground text-sm font-medium">Starter</p>
					<CardTitle className="text-2xl">Create your account</CardTitle>
					<CardDescription>Create your secure starter account</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit}>
						<FieldGroup>
							{displayError ? (
								<Alert variant="destructive">
									<HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
									<AlertTitle>Could not create account</AlertTitle>
									<AlertDescription>{displayError}</AlertDescription>
								</Alert>
							) : null}

							<Field>
								<FieldLabel htmlFor="signup-email">Email</FieldLabel>
								<InputGroup>
									<InputGroupAddon>
										<HugeiconsIcon icon={Mail01Icon} strokeWidth={2} />
									</InputGroupAddon>
									<InputGroupInput
										id="signup-email"
										type="email"
										placeholder="you@school.edu"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										autoComplete="email"
										disabled={submitting}
									/>
								</InputGroup>
								<FieldDescription>
									We&apos;ll use this for sign-in and account recovery.
								</FieldDescription>
							</Field>

							<Field>
								<FieldLabel htmlFor="signup-username">Username</FieldLabel>
								<InputGroup>
									<InputGroupAddon>
										<HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
									</InputGroupAddon>
									<InputGroupInput
										id="signup-username"
										type="text"
										placeholder="johndoe"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required
										minLength={2}
										maxLength={64}
										pattern="[a-zA-Z0-9._-]+"
										title="Letters, numbers, dots, underscores, and hyphens only"
										autoComplete="username"
										disabled={submitting}
									/>
								</InputGroup>
							</Field>

							<Field data-invalid={passwordsMismatch || undefined}>
								<FieldLabel htmlFor="signup-password">Password</FieldLabel>
								<InputGroup>
									<InputGroupInput
										id="signup-password"
										type={showPassword ? "text" : "password"}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										minLength={12}
										autoComplete="new-password"
										disabled={submitting}
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupButton
											size="icon-xs"
											aria-label={showPassword ? "Hide password" : "Show password"}
											onClick={() => setShowPassword((prev) => !prev)}
										>
											<HugeiconsIcon
												icon={showPassword ? ViewOffSlashIcon : ViewIcon}
												strokeWidth={2}
											/>
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
								<FieldDescription>Must be at least 12 characters.</FieldDescription>
							</Field>

							<Field data-invalid={passwordsMismatch || undefined}>
								<FieldLabel htmlFor="signup-confirm-password">Confirm password</FieldLabel>
								<InputGroup>
									<InputGroupInput
										id="signup-confirm-password"
										type={showPassword ? "text" : "password"}
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										required
										minLength={12}
										autoComplete="new-password"
										aria-invalid={passwordsMismatch || undefined}
										disabled={submitting}
									/>
								</InputGroup>
								{passwordsMismatch ? (
									<FieldDescription className="text-destructive">
										Passwords do not match.
									</FieldDescription>
								) : null}
							</Field>

							<Field>
								<Button type="submit" className="w-full" disabled={submitting || passwordsMismatch}>
									{submitting ? <Spinner data-icon="inline-start" /> : null}
									{submitting ? "Creating account…" : "Create account"}
								</Button>
							</Field>

							<FieldDescription className="text-center">
								Already have an account?{" "}
								<Link href="/login" className="text-primary underline underline-offset-4">
									Sign in
								</Link>
							</FieldDescription>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By continuing, you agree to our Terms of Service and Privacy Policy.
			</FieldDescription>
		</div>
	);
}
