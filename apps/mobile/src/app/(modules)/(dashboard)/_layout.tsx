import { Tabs } from "expo-router";
import { BarChart3, BookOpen, LayoutDashboard, NotebookPen } from "lucide-react-native";
import { AppColors } from "@/constants/design-system";

export default function DashboardLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor: AppColors.surface,
					borderTopColor: AppColors.card.border,
					height: 78,
					paddingBottom: 12,
					paddingTop: 8,
				},
				tabBarActiveTintColor: AppColors.primary.brand,
				tabBarInactiveTintColor: AppColors.text.muted,
				tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => (
						<LayoutDashboard color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
					),
				}}
			/>
			<Tabs.Screen
				name="classes"
				options={{
					title: "Classes",
					tabBarIcon: ({ color, focused }) => (
						<BookOpen color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
					),
				}}
			/>
			<Tabs.Screen
				name="work"
				options={{
					title: "Work",
					tabBarIcon: ({ color, focused }) => (
						<NotebookPen color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
					),
				}}
			/>
			<Tabs.Screen
				name="reports"
				options={{
					title: "Reports",
					tabBarIcon: ({ color, focused }) => (
						<BarChart3 color={color} size={22} strokeWidth={focused ? 2.5 : 1.8} />
					),
				}}
			/>
			<Tabs.Screen name="insights" options={{ href: null }} />
		</Tabs>
	);
}
