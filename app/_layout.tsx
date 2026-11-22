import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "../src/contexts/ThemeContext";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { getDatabase } from "../src/database/db";
import { AppTheme } from "../src/theme/theme";

function RootNavigator() {
  const { theme, isDark } = useTheme();
  const { isLoading } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState(false);

  const initDatabase = useCallback(() => {
    setDatabaseError(false);
    setDatabaseReady(false);

    getDatabase()
      .then(() => {
        setDatabaseReady(true);
      })
      .catch((error) => {
        console.error("Database init failed", error);
        setDatabaseError(true);
      });
  }, []);

  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  if (databaseError) {
    return (
      <View style={styles.center}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={styles.errorTitle}>Database failed to load</Text>
        <Text style={styles.errorSubtitle}>
          Something went wrong while initializing local storage.
        </Text>
        <Pressable
          onPress={initDatabase}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.retryButtonPressed,
          ]}
        >
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading || !databaseReady) {
    return (
      <View style={styles.center}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="destination/[id]" />
        <Stack.Screen name="trip/add" options={{ presentation: "modal" }} />
        <Stack.Screen name="trip/[id]/index" />
        <Stack.Screen name="trip/[id]/edit" />
        <Stack.Screen name="trip/[id]/itinerary" />
        <Stack.Screen
          name="trip/[id]/activity"
          options={{ presentation: "modal" }}
        />
        <Stack.Screen name="trip/[id]/expenses" />
        <Stack.Screen name="trip/[id]/photos" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={rootStyles.root}>
        <ThemeProvider>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const rootStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: theme.spacing.sm,
      textAlign: "center",
      color: theme.colors.danger,
    },
    errorSubtitle: {
      fontSize: 14,
      textAlign: "center",
      marginBottom: theme.spacing.lg,
      lineHeight: 20,
      color: theme.colors.textSecondary,
    },
    retryButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm + theme.spacing.xs,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
    },
    retryButtonPressed: {
      opacity: 0.85,
    },
    retryText: {
      color: theme.colors.surface,
      fontSize: 15,
      fontWeight: "600",
    },
  });
