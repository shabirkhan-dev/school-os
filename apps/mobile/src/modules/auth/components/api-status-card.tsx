import { RefreshCw, Server, ServerOff } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Tokens, Type } from "@/constants/design-system";
import { apiClient } from "@/lib/api/client";

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
				setDetail(null);
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
			accessibilityLiveRegion="polite"
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
						<ActivityIndicator size="small" color={Colors.text.secondary} />
					) : online ? (
						<Server size={17} color={Colors.status.present.fg} />
					) : (
						<ServerOff size={17} color={Colors.status.absent.fg} />
					)}
				</View>
				<View style={styles.copy}>
					<Text style={styles.title}>
						{checking
							? "Connecting securely…"
							: online
								? "System online"
								: "Connection unavailable"}
					</Text>
					<Text style={styles.subtitle} numberOfLines={1}>
						{checking
							? "Checking school services"
							: online
								? "Ready for secure sign in"
								: "Check the server, then retry"}
					</Text>
				</View>
				{!checking && !online ? (
					<PressableScale
						onPress={() => void check()}
						scaleTo={0.9}
						style={styles.retry}
						accessibilityRole="button"
						accessibilityLabel="Retry service connection"
					>
						<RefreshCw size={16} color={Colors.brand.base} />
					</PressableScale>
				) : null}
			</View>
			{!checking && detail ? <Text style={styles.detail}>{detail}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: Tokens.radius.md,
		borderWidth: StyleSheet.hairlineWidth,
		padding: Tokens.space["3"],
		gap: Tokens.space["2"],
	},
	cardOnline: {
		borderColor: Colors.status.present.border,
		backgroundColor: Colors.status.present.bg,
	},
	cardChecking: {
		borderColor: Colors.border.subtle,
		backgroundColor: Colors.sunken,
	},
	cardOffline: {
		borderColor: Colors.status.absent.border,
		backgroundColor: Colors.status.absent.bg,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Tokens.space["2.5"],
	},
	icon: {
		width: 36,
		height: 36,
		borderRadius: Tokens.radius.sm,
		alignItems: "center",
		justifyContent: "center",
	},
	iconOnline: {
		backgroundColor: Colors.surfaceBright,
	},
	iconChecking: {
		backgroundColor: Colors.surface,
	},
	iconOffline: {
		backgroundColor: Colors.surfaceBright,
	},
	copy: {
		flex: 1,
		gap: Tokens.space["0.5"],
	},
	title: {
		...Type.meta,
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.bold,
	},
	subtitle: {
		...Type.caption,
		color: Colors.text.secondary,
	},
	detail: {
		...Type.caption,
		color: Colors.text.secondary,
	},
	retry: {
		width: Tokens.touchTarget,
		height: Tokens.touchTarget,
		borderRadius: Tokens.radius.full,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.surfaceBright,
	},
});
