import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../src/contexts/ThemeContext";
import { AppTheme } from "../src/theme/theme";

export default function NotFoundScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="compass-outline" size={56} color={theme.colors.primary} />
      <Text style={styles.title}>Page Not Found</Text>
      <Text style={styles.subtitle}>
        Looks like this destination is off the map.
      </Text>
      <Pressable
        onPress={() => router.replace("/(drawer)/(tabs)")}
        style={({ pressed }) => [styles.btn, pressed && styles.pressed]}
      >
        <Text style={styles.btnText}>Back to Home</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    btn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: 14,
      borderRadius: theme.radius.pill,
    },
    btnText: {
      fontSize: 15.5,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
