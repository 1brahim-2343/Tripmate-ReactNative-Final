import { Redirect } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";
import { useEffect, useState } from "react";
import { storage } from "../src/services/storage";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "../src/contexts/ThemeContext";

export default function Index() {
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [isOnboardingDone, setIsOnboardingDone] = useState<boolean | null>(
    null,
  );
  useEffect(() => {
    (async () => {
      // await storage.resetIsOnboarding(); // temporary reset(for testing purposes)
      const done = await storage.isOnboardingDone();
      setIsOnboardingDone(done);
    })();
  }, []);

  if (isOnboardingDone === null) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!isOnboardingDone) {
    return <Redirect href="/(auth)/onboarding" />;
  }
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/(drawer)/(tabs)" />;
}
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
