import { LockKeyhole, LogIn, Mail } from "lucide-react-native";
import { AuthButton } from "../auth-button";
import { AuthField } from "../auth-field";

interface LoginCredentialsFormProps {
	email: string;
	password: string;
	showPassword: boolean;
	pending: boolean;
	onEmailChange: (value: string) => void;
	onPasswordChange: (value: string) => void;
	onTogglePassword: () => void;
	onForgotPassword: () => void;
	onSubmit: () => void;
}

export function LoginCredentialsForm(props: LoginCredentialsFormProps) {
	return (
		<>
			<AuthField
				label="Email"
				value={props.email}
				onChangeText={props.onEmailChange}
				placeholder="you@example.com"
				keyboardType="email-address"
				autoComplete="email"
				editable={!props.pending}
				icon={Mail}
			/>
			<AuthField
				label="Password"
				value={props.password}
				onChangeText={props.onPasswordChange}
				secureTextEntry={!props.showPassword}
				showPasswordToggle
				onTogglePassword={props.onTogglePassword}
				autoComplete="password"
				editable={!props.pending}
				rightLink={{ label: "Forgot password?", onPress: props.onForgotPassword }}
				icon={LockKeyhole}
				returnKeyType="done"
				onSubmitEditing={props.onSubmit}
			/>
			<AuthButton
				label={props.pending ? "Signing in..." : "Sign in"}
				onPress={props.onSubmit}
				pending={props.pending}
				icon={LogIn}
			/>
		</>
	);
}
