import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AppProviders } from "@/components/providers";
import { Colors } from "@/constants/design-system";
import { useAuth } from "@/modules/auth";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
	initialRouteName: "(modules)",
};

const SchoolTheme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: Colors.canvas,
		card: Colors.surface,
		text: Colors.text.primary,
		border: Colors.border.base,
		primary: Colors.brand.base,
	},
};

export default function RootLayout() {
	return (
		<AppProviders>
			<ThemeProvider value={SchoolTheme}>
				<StatusBar style="dark" />
				<AnimatedSplashOverlay />
				<SplashScreenController />
				<RootNavigator />
			</ThemeProvider>
		</AppProviders>
	);
}

function SplashScreenController() {
	const { loading } = useAuth();
	if (!loading) {
		SplashScreen.hideAsync().catch(() => undefined);
	}
	return null;
}

function RootNavigator() {
	const { user, loading } = useAuth();
	const signedIn = !!user;

	if (loading) {
		return null;
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Protected guard={signedIn}>
				<Stack.Screen name="(modules)" />
			</Stack.Protected>
			<Stack.Protected guard={!signedIn}>
				<Stack.Screen name="(auth)" />
			</Stack.Protected>
		</Stack>
	);
}
