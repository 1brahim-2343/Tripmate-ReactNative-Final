import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { Trip } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";

const FALLBACK_TRIP_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";

export default function TripOverviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activityCount, setActivityCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTripDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [tripData, activities] = await Promise.all([
        tripsRepo.getTripById(id),
        tripsRepo.getActivitiesByTripId(id),
      ]);
      setTrip(tripData);
      setActivityCount(activities.length);
    } catch (error) {
      console.error("Failed to load trip overview", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadTripDetails();
    }, [loadTripDetails]),
  );

  const handleToggleStatus = async () => {
    if (!trip) return;
    const nextStatus = trip.status === "upcoming" ? "past" : "upcoming";
    const updated: Trip = { ...trip, status: nextStatus };
    try {
      await tripsRepo.updateTrip(updated);
      setTrip(updated);
    } catch (error) {
      console.error("Failed to update trip status", error);
    }
  };

  const handleDeleteTrip = () => {
    if (!trip) return;
    Alert.alert(
      "Delete Trip",
      `Are you sure you want to delete "${trip.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await tripsRepo.deleteTrip(trip.id);
            router.replace("/(drawer)/(tabs)/trips");
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>Loading trip overview...</Text>
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.stateBox}>
        <Ionicons
          name="alert-circle-outline"
          size={44}
          color={theme.colors.danger}
        />
        <Text style={styles.emptyTitle}>Trip not found</Text>
        <Pressable
          onPress={() => router.replace("/(drawer)/(tabs)/trips")}
          style={({ pressed }) => [
            styles.backHomeBtn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.backHomeBtnText}>Back to My Trips</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topImageBox}>
          <Image
            source={{ uri: trip.coverImage || FALLBACK_TRIP_IMAGE }}
            resizeMode="cover"
            style={styles.topImage}
          />

          <View
            style={[
              styles.topButtonsRow,
              { top: Math.max(insets.top, theme.spacing.md) + 6 },
            ]}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [
                styles.circleBtn,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={theme.colors.text}
              />
            </Pressable>

            <View style={styles.rightBtnsGroup}>
              <Pressable
                onPress={() => router.push(`/trip/${trip.id}/edit`)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.circleBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={theme.colors.text}
                />
              </Pressable>

              <Pressable
                onPress={handleDeleteTrip}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.circleBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.danger}
                />
              </Pressable>
            </View>
          </View>

          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.92)"]}
            style={styles.imageGradient}
          >
            <Text style={styles.overlayTitle}>{trip.title}</Text>

            <View style={styles.overlayMetaRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={theme.colors.surface}
              />
              <Text style={styles.overlayMetaText}>
                {trip.startDate} – {trip.endDate}
              </Text>
            </View>

            <View style={styles.overlayMetaRow}>
              <Ionicons
                name="people-outline"
                size={15}
                color={theme.colors.surface}
              />
              <Text style={styles.overlayMetaText}>
                2 travelers • {trip.city}, {trip.country}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.travelersRow}>
            <View style={styles.avatarsGroup}>
              <View style={styles.avatarCircle}>
                <Ionicons
                  name="person"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <View style={[styles.avatarCircle, styles.avatarOverlap]}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={theme.colors.primary}
                />
              </View>
              <Pressable
                onPress={() => router.push(`/trip/${trip.id}/edit`)}
                style={[styles.addAvatarCircle, styles.avatarOverlap]}
              >
                <Ionicons name="add" size={18} color={theme.colors.primary} />
              </Pressable>
            </View>

            <Pressable
              onPress={handleToggleStatus}
              style={({ pressed }) => [
                styles.statusBadge,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={
                  trip.status === "upcoming"
                    ? "time-outline"
                    : "checkmark-circle-outline"
                }
                size={15}
                color={theme.colors.primary}
              />
              <Text style={styles.statusBadgeText}>
                {trip.status === "upcoming" ? "Upcoming" : "Past Trip"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Trip Summary</Text>
            <Text style={styles.summaryDescription}>
              An unforgettable journey through {trip.city}, {trip.country}.{" "}
              {activityCount > 0
                ? `${activityCount} planned ${
                    activityCount === 1 ? "activity" : "activities"
                  } in your itinerary.`
                : "Start building your day-by-day itinerary below!"}
            </Text>

            <View style={styles.summaryFooter}>
              <View style={styles.budgetTag}>
                <Ionicons
                  name="wallet-outline"
                  size={15}
                  color={theme.colors.primary}
                />
                <Text style={styles.budgetTagText}>
                  Total Budget: ${trip.totalBudget.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsGrid}>
            <Pressable
              onPress={() => router.push(`/trip/${trip.id}/itinerary`)}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="calendar-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.actionCardLabel}>Itinerary</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push(`/trip/${trip.id}/photos`)}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIconBox}>
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.actionCardLabel}>Photos</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push(`/trip/${trip.id}/activity`)}
            style={({ pressed }) => [
              styles.addActivityBtn,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="star-outline"
              size={20}
              color={theme.colors.surface}
            />
            <Text style={styles.addActivityBtnText}>Add Activity</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingBottom: 60,
    },
    topImageBox: {
      width: "100%",
      height: 360,
      backgroundColor: theme.colors.surfaceAlt,
      justifyContent: "flex-end",
    },
    topImage: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    topButtonsRow: {
      position: "absolute",
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    rightBtnsGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    circleBtn: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    imageGradient: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 60,
      paddingBottom: 24,
      gap: 6,
    },
    overlayTitle: {
      fontSize: 30,
      fontWeight: "800",
      color: theme.colors.surface,
      marginBottom: 2,
    },
    overlayMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    overlayMetaText: {
      fontSize: 14.5,
      fontWeight: "600",
      color: theme.colors.surface,
      opacity: 0.92,
    },
    mainContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    travelersRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: theme.spacing.lg,
    },
    avatarsGroup: {
      flexDirection: "row",
      alignItems: "center",
    },
    avatarCircle: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 2,
      borderColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    addAvatarCircle: {
      width: 42,
      height: 42,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarOverlap: {
      marginLeft: -10,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
    },
    statusBadgeText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    summaryCard: {
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    summaryTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 8,
    },
    summaryDescription: {
      fontSize: 14.5,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    summaryFooter: {
      flexDirection: "row",
      alignItems: "center",
    },
    budgetTag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radius.pill,
    },
    budgetTagText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.text,
    },
    actionsGrid: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    actionCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    actionIconBox: {
      width: 46,
      height: 46,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    actionCardLabel: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
    addActivityBtn: {
      height: 52,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    addActivityBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    stateBox: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    stateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    backHomeBtn: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 12,
      borderRadius: theme.radius.pill,
    },
    backHomeBtnText: {
      fontSize: 14.5,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
