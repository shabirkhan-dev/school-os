import { Check, ImagePlus } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, View } from "react-native";
import { PressableScale } from "@/components/ui/pressable-scale";
import { Colors, Elevation, Tokens, Type } from "@/constants/design-system";
import { resolveMediaUrl } from "@/lib/media-url";
import { buildAvatarTemplates } from "../lib/avatar-templates";

interface AvatarPickerProps {
	seed: string;
	value: string | null | undefined;
	pending?: boolean;
	uploading?: boolean;
	onSelectTemplate: (url: string) => void;
	onPickFromDevice: () => void;
}

export function AvatarPicker({
	seed,
	value,
	pending = false,
	uploading = false,
	onSelectTemplate,
	onPickFromDevice,
}: AvatarPickerProps) {
	const templates = buildAvatarTemplates(seed);
	const busy = pending || uploading;
	const previewUri = resolveMediaUrl(value);
	const [failedUri, setFailedUri] = useState<string | null>(null);
	const previewFailed = previewUri != null && failedUri === previewUri;

	return (
		<View style={styles.wrap}>
			<View style={styles.heading}>
				<Text style={styles.label}>Profile photo</Text>
				<Text style={styles.caption}>JPEG, PNG, or WebP up to 2 MB</Text>
			</View>

			<View style={styles.previewRow}>
				<View style={styles.preview}>
					{previewUri && !previewFailed ? (
						<Image
							key={previewUri}
							source={{ uri: previewUri }}
							style={styles.previewImage}
							onError={() => setFailedUri(previewUri)}
						/>
					) : (
						<UserFallback seed={seed} />
					)}
				</View>
				<View style={styles.uploadCopy}>
					<Text style={styles.uploadTitle}>Use your own photo</Text>
					<Text style={styles.uploadDescription}>Square images work best.</Text>
					<PressableScale
						style={[styles.uploadButton, busy && styles.disabled]}
						disabled={busy}
						onPress={onPickFromDevice}
						scaleTo={0.97}
						dim={false}
						accessibilityRole="button"
						accessibilityState={{ disabled: busy, busy: uploading }}
						accessibilityLabel="Upload profile photo"
					>
						{uploading ? (
							<ActivityIndicator color={Colors.brand.base} size="small" />
						) : (
							<>
								<ImagePlus size={16} color={Colors.text.primary} strokeWidth={2} />
								<Text style={styles.uploadLabel}>Choose photo</Text>
							</>
						)}
					</PressableScale>
				</View>
			</View>

			<View style={styles.templateHeading}>
				<Text style={styles.templateTitle}>Or choose an illustrated avatar</Text>
				<Text style={styles.templateHint}>Tap one to preview it.</Text>
			</View>
			<View style={styles.grid}>
				{templates.map((template) => {
					const selected = value === template.url;
					return (
						<PressableScale
							key={template.id}
							disabled={busy}
							onPress={() => onSelectTemplate(template.url)}
							style={[
								styles.template,
								selected && styles.templateSelected,
								busy && styles.disabled,
							]}
							scaleTo={0.93}
							dim={false}
							accessibilityRole="button"
							accessibilityState={{ selected, disabled: busy }}
							accessibilityLabel={`Choose avatar ${template.id}`}
						>
							<Image source={{ uri: template.url }} style={styles.templateImage} />
							{selected ? (
								<View style={styles.check}>
									<Check size={12} color={Colors.text.inverse} strokeWidth={3} />
								</View>
							) : null}
						</PressableScale>
					);
				})}
			</View>
		</View>
	);
}

function UserFallback({ seed }: { seed: string }) {
	const initials = seed
		.trim()
		.split(/[\s._-]+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join("");

	return <Text style={styles.previewFallback}>{initials || "SO"}</Text>;
}

export function alertAvatarPermissionDenied() {
	Alert.alert(
		"Photo access needed",
		"Allow photo library access to upload an avatar from your device.",
	);
}

const styles = StyleSheet.create({
	wrap: { gap: Tokens.space["4"] },
	heading: { gap: Tokens.space["0.5"] },
	label: { ...Type.meta, color: Colors.text.primary, fontWeight: Tokens.fontWeight.semibold },
	caption: Type.caption,
	previewRow: { flexDirection: "row", alignItems: "center", gap: Tokens.space["4"] },
	preview: {
		width: 72,
		height: 72,
		borderRadius: Tokens.radius.full,
		overflow: "hidden",
		backgroundColor: Colors.brand.tint,
		alignItems: "center",
		justifyContent: "center",
		...Elevation.raised,
	},
	previewImage: { width: "100%", height: "100%" },
	previewFallback: {
		fontSize: Tokens.fontSize["3xl"],
		fontWeight: Tokens.fontWeight.bold,
		color: Colors.brand.strong,
	},
	uploadCopy: { flex: 1, gap: Tokens.space["1"] },
	uploadTitle: { ...Type.meta, color: Colors.text.primary, fontWeight: Tokens.fontWeight.semibold },
	uploadDescription: Type.caption,
	uploadButton: {
		alignSelf: "flex-start",
		minHeight: Tokens.touchTarget,
		marginTop: Tokens.space["1"],
		paddingHorizontal: Tokens.space["3"],
		borderRadius: Tokens.radius.sm,
		backgroundColor: Colors.surfaceBright,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border.base,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: Tokens.space["2"],
		...Elevation.raised,
	},
	uploadLabel: {
		fontSize: Tokens.fontSize.base,
		fontWeight: Tokens.fontWeight.semibold,
		color: Colors.text.primary,
	},
	templateHeading: { gap: Tokens.space["0.5"], marginTop: Tokens.space["1"] },
	templateTitle: {
		...Type.meta,
		color: Colors.text.primary,
		fontWeight: Tokens.fontWeight.semibold,
	},
	templateHint: Type.caption,
	grid: { flexDirection: "row", flexWrap: "wrap", gap: Tokens.space["2.5"] },
	template: {
		width: 60,
		height: 60,
		borderRadius: Tokens.radius.lg,
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "transparent",
		backgroundColor: Colors.sunken,
	},
	templateSelected: { borderColor: Colors.brand.base, ...Elevation.lifted },
	templateImage: { width: "100%", height: "100%" },
	check: {
		position: "absolute",
		right: 4,
		bottom: 4,
		width: 20,
		height: 20,
		borderRadius: Tokens.radius.full,
		backgroundColor: Colors.brand.base,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: Colors.surfaceBright,
	},
	disabled: { opacity: 0.5 },
});
