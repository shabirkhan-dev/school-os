import { Tabs } from "expo-router";
import { BarChart3, BookOpen, LayoutDashboard, NotebookPen } from "lucide-react-native";
import { TabBar } from "@/components/ui/tab-bar";

/** Focused tabs use a heavier stroke so the active icon reads without relying on colour alone. */
const stroke = (focused: boolean) => (focused ? 2.4 : 1.8);

export default function DashboardLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, focused }) => (
						<LayoutDashboard color={color} size={21} strokeWidth={stroke(focused)} />
					),
				}}
			/>
			<Tabs.Screen
				name="classes"
				options={{
					title: "Classes",
					tabBarIcon: ({ color, focused }) => (
						<BookOpen color={color} size={21} strokeWidth={stroke(focused)} />
					),
				}}
			/>
			<Tabs.Screen
				name="work"
				options={{
					title: "Work",
					tabBarIcon: ({ color, focused }) => (
						<NotebookPen color={color} size={21} strokeWidth={stroke(focused)} />
					),
				}}
			/>
			<Tabs.Screen
				name="reports"
				options={{
					title: "Reports",
					tabBarIcon: ({ color, focused }) => (
						<BarChart3 color={color} size={21} strokeWidth={stroke(focused)} />
					),
				}}
			/>
			<Tabs.Screen name="insights" options={{ href: null }} />
		</Tabs>
	);
}
