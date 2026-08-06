import { BarChart3, FileText } from "lucide-react-native";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/ui/empty-state";
import { OSHeader } from "@/components/ui/os-header";
import { AppColors } from "@/constants/design-system";

export default function InsightsScreen() {
	return (
		<View style={styles.container}>
			<SafeAreaView edges={["top"]} style={styles.safeArea}>
				<OSHeader />
				<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
					<Text style={styles.eyebrow}>SCHOOL INSIGHTS</Text>
					<Text style={styles.title}>Reports</Text>
					<Text style={styles.subtitle}>
						Attendance, learning progress, and class signals will live here.
					</Text>
					<EmptyState
						icon={BarChart3}
						title="Reports are coming next"
						description="The teacher dashboard is ready first. Reporting modules will be connected to the same school data layer."
					/>
					<View style={styles.note}>
						<FileText size={16} color={AppColors.primary.brand} />
						<Text style={styles.noteText}>
							Nothing is being fabricated locally — reports will use verified school records.
						</Text>
					</View>
				</ScrollView>
			</SafeAreaView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: AppColors.background },
	safeArea: { flex: 1 },
	content: { padding: 20, paddingBottom: 48 },
	eyebrow: { color: AppColors.primary.brand, fontSize: 11, fontWeight: "800", letterSpacing: 1.2 },
	title: { color: AppColors.text.primary, fontSize: 30, fontWeight: "800", marginTop: 4 },
	subtitle: { color: AppColors.text.secondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
	note: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		marginHorizontal: 16,
		padding: 12,
		borderRadius: 12,
		backgroundColor: AppColors.primary.subtle,
	},
	noteText: { flex: 1, color: AppColors.text.secondary, fontSize: 12, lineHeight: 17 },
});
