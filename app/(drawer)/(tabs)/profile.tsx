import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { useAuth } from "../../../src/contexts/AuthContext";
import { AppTheme } from "../../../src/theme/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { userEmail, logout, userName } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(true);

  const handleSignOut = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Toppest part (Header) */}
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Profile & Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* user info */}
        <View style={styles.profileBox}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={44} color={theme.colors.primary} />
          </View>

          <Text style={styles.userName}>{userName ?? "Demo User"} </Text>
          <Text style={styles.userEmail}>
            {userEmail ?? "demouser@example.com"}
          </Text>
        </View>

        <View style={styles.settingsGroup}>
          <Pressable
            onPress={() =>
              Alert.alert(
                "Preferences",
                "Currency: USD ($)\nUnits: Metric (km, °C)",
              )
            }
            style={({ pressed }) => [
              styles.settingRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="globe-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={styles.rowLabel}>My Preferences</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="moon-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={styles.rowLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor={theme.colors.surface}
            />
          </View>

          <Pressable
            onPress={() => Alert.alert("Language", "Current language: English")}
            style={({ pressed }) => [
              styles.settingRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="globe-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={styles.rowLabel}>Language</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValueText}>English</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textSecondary}
              />
            </View>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingsGroup}>
          <Pressable
            onPress={() =>
              Alert.alert("Help & Support", "Contact support@tripmate.app")
            }
            style={({ pressed }) => [
              styles.settingRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={styles.rowLabel}>Help & Support</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert(
                "About TripMate",
                "TripMate v1.0.0\nExplore. Plan. Remember.",
              )
            }
            style={({ pressed }) => [
              styles.settingRow,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.rowLeft}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.colors.text}
              />
              <Text style={styles.rowLabel}>About TripMate</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.textSecondary}
            />
          </Pressable>
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color={theme.colors.danger}
          />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: 120,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 19,
      fontWeight: "800",
      color: theme.colors.text,
    },
    headerSpacer: {
      width: 40,
    },
    profileBox: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
    },
    avatarWrapper: {
      width: 96,
      height: 96,
      borderRadius: theme.radius.pill,
      marginBottom: theme.spacing.md,
    },
    avatarImage: {
      width: 96,
      height: 96,
      borderRadius: theme.radius.pill,
    },
    avatarPlaceholder: {
      width: 96,
      height: 96,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cameraBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      borderWidth: 2,
      borderColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    userName: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    settingsGroup: {
      gap: theme.spacing.xs,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: 52,
      paddingVertical: theme.spacing.xs,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    rowLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    rowValueText: {
      fontSize: 15,
      color: theme.colors.textSecondary,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    signOutBtn: {
      marginTop: theme.spacing.xl,
      height: 52,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    signOutText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.danger,
    },
    pressed: {
      opacity: 0.85,
    },
  });
