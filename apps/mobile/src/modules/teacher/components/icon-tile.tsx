import type { LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Colors, Elevation, Tokens } from "@/constants/design-system";

interface IconTileProps {
	icon: LucideIcon;
	color?: string;
	background?: string;
	size?: number;
	iconSize?: number;
}

export function IconTile({
	icon: Icon,
	color = Colors.brand.base,
	background = Colors.brand.tint,
	size = 44,
	iconSize = 22,
}: IconTileProps) {
	return (
		<View
			style={[
				styles.tile,
				{
					width: size,
					height: size,
					borderRadius: Math.max(Tokens.radius.sm, size / 3),
					backgroundColor: background,
				},
				Elevation.well,
			]}
		>
			<Icon size={iconSize} color={color} strokeWidth={2} />
		</View>
	);
}

const styles = StyleSheet.create({
	tile: {
		alignItems: "center",
		justifyContent: "center",
	},
});
