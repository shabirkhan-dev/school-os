import { StyleSheet, Text, View } from "react-native";
import { AppColors } from "@/constants/design-system";

export type StatusVariant =
	| "present"
	| "absent"
	| "late"
	| "excused"
	| "pending"
	| "published"
	| "draft"
	| "brand";

interface StatusBadgeProps {
	label: string;
	status?: StatusVariant;
	size?: "sm" | "md";
}

export function StatusBadge({ label, status = "pending", size = "md" }: StatusBadgeProps) {
	const stylesForStatus = getStatusStyles(status);

	return (
		<View
			style={[
				styles.container,
				size === "sm" ? styles.smContainer : styles.mdContainer,
				{ backgroundColor: stylesForStatus.bg, borderColor: stylesForStatus.border },
			]}
		>
			<View style={[styles.dot, { backgroundColor: stylesForStatus.color }]} />
			<Text
				style={[
					styles.text,
					size === "sm" ? styles.smText : styles.mdText,
					{ color: stylesForStatus.color },
				]}
			>
				{label}
			</Text>
		</View>
	);
}

function getStatusStyles(status: StatusVariant) {
	switch (status) {
		case "present":
			return {
				bg: AppColors.status.presentBg,
				border: "#BBF7D0",
				color: AppColors.status.present,
			};
		case "absent":
			return {
				bg: AppColors.status.absentBg,
				border: "#FECACA",
				color: AppColors.status.absent,
			};
		case "late":
			return {
				bg: AppColors.status.lateBg,
				border: "#FDE68A",
				color: AppColors.status.late,
			};
		case "excused":
			return {
				bg: AppColors.status.excusedBg,
				border: "#BFDBFE",
				color: AppColors.status.excused,
			};
		case "published":
		case "brand":
			return {
				bg: AppColors.primary.subtle,
				border: "#BFDBFE",
				color: AppColors.primary.brand,
			};
		default:
			return {
				bg: AppColors.status.pendingBg,
				border: AppColors.card.border,
				color: AppColors.status.pending,
			};
	}
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 999,
		borderWidth: 1,
		alignSelf: "flex-start",
	},
	smContainer: {
		paddingHorizontal: 8,
		paddingVertical: 3,
		gap: 4,
	},
	mdContainer: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		gap: 6,
	},
	dot: {
		width: 6,
		height: 6,
		borderRadius: 3,
	},
	text: {
		fontWeight: "600",
		textTransform: "capitalize",
	},
	smText: {
		fontSize: 11,
	},
	mdText: {
		fontSize: 12,
	},
});
