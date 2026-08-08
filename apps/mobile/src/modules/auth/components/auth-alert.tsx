import { CircleAlert, Info } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Tokens, Type } from "@/constants/design-system";

interface AuthAlertProps {
	title?: string;
	message: string;
	variant?: "destructive" | "info";
}

export function AuthAlert({ title, message, variant = "info" }: AuthAlertProps) {
	const destructive = variant === "destructive";
	return (
		<View style={[styles.box, destructive ? styles.destructive : styles.info]}>
			<View style={[styles.icon, destructive ? styles.iconDestructive : styles.iconInfo]}>
				{destructive ? (
					<CircleAlert size={17} color={Colors.status.absent.fg} />
				) : (
					<Info size={17} color={Colors.status.excused.fg} />
				)}
			</View>
			<View style={styles.copy}>
				{title ? (
					<Text style={[styles.title, destructive && styles.destructiveText]}>{title}</Text>
				) : null}
				<Text style={[styles.message, destructive && styles.destructiveText]}>{message}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	box: {
		flexDirection: "row",
		alignItems: "flex-start",
		borderRadius: Tokens.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		padding: Tokens.space["3"],
		gap: Tokens.space["2.5"],
	},
	info: {
		borderColor: Colors.status.excused.border,
		backgroundColor: Colors.status.excused.bg,
	},
	destructive: {
		borderColor: Colors.status.absent.border,
		backgroundColor: Colors.status.absent.bg,
	},
	icon: {
		width: 30,
		height: 30,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
	},
	iconInfo: {
		backgroundColor: Colors.surfaceBright,
	},
	iconDestructive: {
		backgroundColor: Colors.surfaceBright,
	},
	copy: {
		flex: 1,
		gap: Tokens.space["0.5"],
	},
	title: {
		...Type.meta,
		color: Colors.status.excused.fg,
		fontWeight: Tokens.fontWeight.bold,
	},
	message: {
		...Type.caption,
		color: Colors.status.excused.fg,
	},
	destructiveText: {
		color: Colors.status.absent.fg,
	},
});
