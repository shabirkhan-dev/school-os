import { Link, router } from "expo-router";
import { Fingerprint, Mail } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Tokens, Type } from "@/constants/design-system";
import { useAuth } from "@/modules/auth/context/auth-context";
import {
	useLoginMutation,
	useMagicLinkRequestMutation,
	usePasskeyLoginMutation,
	useTwoFactorMutation,
} from "@/modules/auth/hooks/use-auth-mutations";
import { loginSchema } from "@/modules/auth/schemas/auth.schemas";
import type { TwoFactorChallenge } from "@/modules/auth/types/auth.types";
import { ApiStatusCard } from "./api-status-card";
import { AuthAlert } from "./auth-alert";
import { AuthButton } from "./auth-button";
import { AuthScreen } from "./auth-screen";
import { LoginCredentialsForm } from "./presentation/login-credentials-form";
import { TwoFactorForm } from "./presentation/two-factor-form";

export function LoginForm() {
	const { user, loading, error, clearError } = useAuth();
	const login = useLoginMutation();
	const twoFactor = useTwoFactorMutation();
	const magicLink = useMagicLinkRequestMutation();
	const passkey = usePasskeyLoginMutation();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [challenge, setChallenge] = useState<TwoFactorChallenge | null>(null);
	const [code, setCode] = useState("");
	const [notice, setNotice] = useState<string | null>(null);
	const [localError, setLocalError] = useState<string | null>(null);

	if (loading || user) {
		return <AuthScreen busy title="" description="" />;
	}

	const currentError =
		localError ??
		error ??
		(login.error instanceof Error ? login.error.message : null) ??
		(twoFactor.error instanceof Error ? twoFactor.error.message : null) ??
		(magicLink.error instanceof Error ? magicLink.error.message : null) ??
		(passkey.error instanceof Error ? passkey.error.message : null);

	return (
		<AuthScreen
			title={challenge ? "Two-factor verification" : "Welcome back"}
			description={
				challenge
					? "Enter your verification code to finish signing in."
					: "Sign in to manage your school day with confidence."
			}
		>
			<ApiStatusCard />
			{currentError ? (
				<AuthAlert variant="destructive" title="Could not sign in" message={currentError} />
			) : null}
			{notice ? <AuthAlert message={notice} /> : null}

			{challenge ? (
				<TwoFactorForm
					code={code}
					pending={twoFactor.isPending}
					onCodeChange={setCode}
					onCancel={() => {
						setChallenge(null);
						setCode("");
						clearError();
						setLocalError(null);
					}}
					onSubmit={() => {
						twoFactor.mutate(
							{ challengeToken: challenge.challengeToken, code },
							{ onSuccess: () => router.replace("/(modules)/(dashboard)") },
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
						onForgotPassword={() => router.push("/forgot-password")}
						onSubmit={() => {
							clearError();
							setLocalError(null);
							setNotice(null);
							const parsed = loginSchema.safeParse({ email, password });
							if (!parsed.success) {
								setLocalError(parsed.error.issues[0]?.message ?? "Invalid credentials");
								return;
							}
							login.mutate(parsed.data, {
								onSuccess: (result) => {
									if ("requiresTwoFactor" in result) setChallenge(result);
									else router.replace("/(modules)/(dashboard)");
								},
							});
						}}
					/>
					<View style={styles.divider}>
						<View style={styles.methodHeader}>
							<View style={styles.methodLine} />
							<Text style={styles.methodLabel}>Other secure options</Text>
							<View style={styles.methodLine} />
						</View>
						<AuthButton
							label="Use fingerprint or passkey"
							variant="outline"
							pending={passkey.isPending}
							icon={Fingerprint}
							onPress={() => {
								clearError();
								setLocalError(null);
								passkey.mutate(email.trim() || undefined, {
									onSuccess: () => router.replace("/(modules)/(dashboard)"),
								});
							}}
						/>
						<AuthButton
							label="Email me a magic link"
							variant="outline"
							pending={magicLink.isPending}
							disabled={!email.trim()}
							icon={Mail}
							onPress={() => {
								clearError();
								setLocalError(null);
								magicLink.mutate(email.trim(), {
									onSuccess: (result) => {
										setNotice(result.message);
										if (result.developmentToken) {
											router.push({
												pathname: "/magic-link",
												params: { token: result.developmentToken },
											});
										}
									},
								});
							}}
						/>
					</View>
					<Text style={styles.footerText}>
						Don't have an account?{" "}
						<Link href="/register" style={styles.link}>
							Create one
						</Link>
					</Text>
				</>
			)}
		</AuthScreen>
	);
}

const styles = StyleSheet.create({
	divider: {
		paddingTop: Tokens.space["1"],
		gap: Tokens.space["2.5"],
	},
	methodHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["3"],
		paddingVertical: Tokens.space["1"],
	},
	methodLine: {
		flex: 1,
		height: StyleSheet.hairlineWidth,
		backgroundColor: Colors.border.base,
	},
	methodLabel: {
		...Type.caption,
		color: Colors.text.tertiary,
	},
	footerText: {
		...Type.meta,
		color: Colors.text.secondary,
		textAlign: "center",
		marginTop: Tokens.space["1"],
	},
	link: {
		color: Colors.brand.base,
		fontWeight: Tokens.fontWeight.bold,
	},
});
