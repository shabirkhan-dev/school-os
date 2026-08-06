import { RefreshCw, Server, ServerOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { AppColors, AppShadows } from "@/constants/design-system";
import { apiClient, getApiOrigin } from "@/lib/api/client";

type ApiStatus = "checking" | "online" | "offline";

interface HealthResponse {
	status: string;
	service?: string;
}

export function ApiStatusCard() {
	const [status, setStatus] = useState<ApiStatus>("checking");
	const [detail, setDetail] = useState<string | null>(null);

	const check = useCallback(async () => {
		setStatus("checking");
		setDetail(null);
		try {
			const health = await apiClient.get<HealthResponse>("/health");
			if (health.status === "ok") {
				setStatus("online");
				setDetail(health.service ? `service: ${health.service}` : null);
			} else {
				setStatus("offline");
				setDetail(`Unexpected health response: ${health.status}`);
			}
		} catch (caught) {
			setStatus("offline");
			setDetail(caught instanceof Error ? caught.message : "No response from the API");
		}
	}, []);

	useEffect(() => {
		void check();
	}, [check]);

	const online = status === "online";
	const checking = status === "checking";

	return (
		<View
			style={[
				styles.card,
				online ? styles.cardOnline : checking ? styles.cardChecking : styles.cardOffline,
			]}
		>
			<View style={styles.topRow}>
				<View
					style={[
						styles.icon,
						online ? styles.iconOnline : checking ? styles.iconChecking : styles.iconOffline,
					]}
				>
					{checking ? (
						<ActivityIndicator size="small" color={AppColors.text.secondary} />
					) : online ? (
						<Server size={18} color={AppColors.status.present} />
					) : (
						<ServerOff size={18} color={AppColors.status.absent} />
					)}
				</View>
				<View style={styles.copy}>
					<Text style={styles.title}>
						{checking ? "Checking API…" : online ? "API is reachable" : "API is not reachable"}
					</Text>
					<Text style={styles.url} numberOfLines={1}>
						{getApiOrigin()}
					</Text>
				</View>
				<Pressable
					onPress={() => void check()}
					hitSlop={8}
					style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
				>
					<RefreshCw size={16} color={AppColors.primary.brand} />
				</Pressable>
			</View>
			{!checking && detail ? <Text style={styles.detail}>{detail}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 14,
		borderWidth: 1,
		padding: 12,
		gap: 8,
		...AppShadows.sm,
	},
	cardOnline: {
		borderColor: "rgba(22, 163, 74, 0.4)",
		backgroundColor: "rgba(22, 163, 74, 0.08)",
	},
	cardChecking: {
		borderColor: AppColors.card.border,
		backgroundColor: AppColors.surface,
	},
	cardOffline: {
		borderColor: "rgba(220, 38, 38, 0.4)",
		backgroundColor: "rgba(220, 38, 38, 0.08)",
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	icon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	iconOnline: {
		backgroundColor: AppColors.status.presentBg,
	},
	iconChecking: {
		backgroundColor: AppColors.card.subtle,
	},
	iconOffline: {
		backgroundColor: AppColors.status.absentBg,
	},
	copy: {
		flex: 1,
		gap: 2,
	},
	title: {
		color: AppColors.text.primary,
		fontSize: 13,
		fontWeight: "700",
	},
	url: {
		color: AppColors.text.secondary,
		fontSize: 12,
	},
	detail: {
		color: AppColors.text.secondary,
		fontSize: 12,
		lineHeight: 17,
	},
	retry: {
		width: 32,
		height: 32,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: AppColors.primary.subtle,
	},
	retryPressed: {
		opacity: 0.7,
	},
});
