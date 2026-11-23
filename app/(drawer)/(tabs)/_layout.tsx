import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";

export default function TabsLayout() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [aiOpen, setAiOpen] = useState<boolean>(false);

  return (
    <View style={styles.root}>
      <NativeTabs
        tintColor={theme.colors.primary}
        backgroundColor={theme.colors.surface}
        iconColor={{
          default: theme.colors.textSecondary,
          selected: theme.colors.primary,
        }}
        labelStyle={{
          default: { color: theme.colors.textSecondary },
          selected: { color: theme.colors.primary },
        }}
      >
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "house", selected: "house.fill" }}
            md="home"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="map">
          <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "map", selected: "map.fill" }}
            md="map"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="trips">
          <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "suitcase", selected: "suitcase.fill" }}
            md="luggage"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="favorites">
          <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "heart", selected: "heart.fill" }}
            md="favorite"
          />
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon
            sf={{ default: "person", selected: "person.fill" }}
            md="person"
          />
        </NativeTabs.Trigger>
      </NativeTabs>

      <Pressable
        onPress={() => setAiOpen(true)}
        style={({ pressed }) => [styles.aiFab, pressed && styles.pressed]}
      >
        <Ionicons name="sparkles" size={22} color={theme.colors.surface} />
      </Pressable>

      <Modal
        visible={aiOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setAiOpen(false)}
      >
        <BlurView
          intensity={45}
          tint={isDark ? "dark" : "light"}
          style={styles.modalBackdrop}
        >
          <Pressable
            style={styles.backdropDismiss}
            onPress={() => setAiOpen(false)}
          />

          <View style={styles.chatSheet}>
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                <View style={styles.aiAvatar}>
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
                <View>
                  <Text style={styles.chatTitle}>TripMate AI</Text>
                  <Text style={styles.chatStatus}>Maintenance Mode</Text>
                </View>
              </View>

              <Pressable
                onPress={() => setAiOpen(false)}
                hitSlop={10}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={20} color={theme.colors.text} />
              </Pressable>
            </View>

            <View style={styles.chatBody}>
              <View style={styles.botBubble}>
                <Text style={styles.botBubbleText}>
                  👋 Hi Traveler! I’m your TripMate AI Assistant.
                </Text>
              </View>

              <View style={styles.maintenanceCard}>
                <Ionicons
                  name="construct-outline"
                  size={28}
                  color={theme.colors.primary}
                />
                <Text style={styles.maintenanceTitle}>
                  Under Maintenance • Available Soon
                </Text>
                <Text style={styles.maintenanceText}>
                  AI smart itinerary generation and live travel chat are
                  currently being upgraded and will be available in the next
                  release.
                </Text>
              </View>
            </View>

            <View style={styles.disabledInputBar}>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.disabledInputText}>
                AI Chat temporarily unavailable...
              </Text>
            </View>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    aiFab: {
      position: "absolute",
      right: 18,
      bottom: 96,
      width: 52,
      height: 52,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 8,
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: "flex-end",
      padding: theme.spacing.lg,
      paddingBottom: 42,
    },
    backdropDismiss: {
      flex: 1,
    },
    chatSheet: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    chatHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    chatHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    aiAvatar: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    chatTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: theme.colors.text,
    },
    chatStatus: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.colors.warning,
    },
    closeBtn: {
      width: 34,
      height: 34,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    chatBody: {
      gap: 14,
      paddingVertical: theme.spacing.xs,
    },
    botBubble: {
      alignSelf: "flex-start",
      backgroundColor: theme.colors.surfaceAlt,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      borderTopLeftRadius: 4,
    },
    botBubbleText: {
      fontSize: 14.5,
      color: theme.colors.text,
      fontWeight: "500",
    },
    maintenanceCard: {
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.md,
      alignItems: "center",
      gap: 8,
    },
    maintenanceTitle: {
      fontSize: 15,
      fontWeight: "800",
      color: theme.colors.primary,
      textAlign: "center",
    },
    maintenanceText: {
      fontSize: 13.5,
      lineHeight: 19,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    disabledInputBar: {
      flexDirection: "row",
      alignItems: "center",
      height: 46,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      gap: 8,
    },
    disabledInputText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    pressed: {
      opacity: 0.85,
    },
  });
