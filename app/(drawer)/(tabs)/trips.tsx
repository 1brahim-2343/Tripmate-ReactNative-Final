import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { Trip } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";

const FALLBACK_TRIP_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";

export default function MyTripsScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadTrips = useCallback(async () => {
    setIsLoading(true);
    try {
      const allTrips = await tripsRepo.getAllTrips();
      setTrips(allTrips);
    } catch (error) {
      console.error("Failed to load trips", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  const upcomingTrips = useMemo<Trip[]>(
    () => trips.filter((t) => t.status === "upcoming"),
    [trips],
  );

  const pastTrips = useMemo<Trip[]>(
    () => trips.filter((t) => t.status === "past"),
    [trips],
  );

  const handleOpenTrip = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>My Trips</Text>

        <Pressable
          onPress={() => router.push("/trip/create")}
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        >
          <Ionicons name="add" size={26} color={theme.colors.surface} />
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => setActiveTab("upcoming")}
          style={[
            styles.tabBtn,
            activeTab === "upcoming" && styles.tabBtnActive,
          ]}
        >
          <Text
            style={
              activeTab === "upcoming"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Upcoming ({upcomingTrips.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("past")}
          style={[styles.tabBtn, activeTab === "past" && styles.tabBtnActive]}
        >
          <Text
            style={
              activeTab === "past"
                ? styles.tabTextActive
                : styles.tabTextInactive
            }
          >
            Past ({pastTrips.length})
          </Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading your trips...</Text>
        </View>
      ) : activeTab === "upcoming" && upcomingTrips.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons
            name="airplane-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No upcoming trips yet</Text>
          <Text style={styles.stateText}>
            Tap the + button above to plan your next adventure.
          </Text>
          <Pressable
            onPress={() => router.push("/trip/create")}
            style={({ pressed }) => [
              styles.planNowBtn,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.planNowBtnText}>Create a Trip</Text>
          </Pressable>
        </View>
      ) : activeTab === "past" && pastTrips.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons
            name="time-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No past trips</Text>
          <Text style={styles.stateText}>
            Completed trips will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === "upcoming" &&
            upcomingTrips.map((trip) => (
              <Pressable
                key={trip.id}
                onPress={() => handleOpenTrip(trip.id)}
                style={({ pressed }) => [
                  styles.upcomingCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.upcomingImageBox}>
                  <Image
                    source={{ uri: trip.coverImage || FALLBACK_TRIP_IMAGE }}
                    resizeMode="cover"
                    style={styles.upcomingImage}
                  />
                </View>

                <View style={styles.upcomingBody}>
                  <View style={styles.upcomingInfo}>
                    <Text numberOfLines={1} style={styles.upcomingTitle}>
                      {trip.title}
                    </Text>

                    <View style={styles.dateRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={15}
                        color={theme.colors.textSecondary}
                      />
                      <Text style={styles.dateText}>
                        {trip.startDate} – {trip.endDate}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </Pressable>
            ))}

          {(activeTab === "past" || pastTrips.length > 0) && (
            <View style={styles.pastSection}>
              {activeTab === "upcoming" && (
                <Text style={styles.pastSectionTitle}>Past Trips</Text>
              )}

              {pastTrips.map((trip) => (
                <Pressable
                  key={trip.id}
                  onPress={() => handleOpenTrip(trip.id)}
                  style={({ pressed }) => [
                    styles.pastCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    source={{ uri: trip.coverImage || FALLBACK_TRIP_IMAGE }}
                    resizeMode="cover"
                    style={styles.pastThumb}
                  />

                  <View style={styles.pastInfo}>
                    <Text numberOfLines={1} style={styles.pastTitle}>
                      {trip.title}
                    </Text>
                    <View style={styles.dateRow}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color={theme.colors.textSecondary}
                      />
                      <Text numberOfLines={1} style={styles.dateText}>
                        {trip.startDate} - {trip.endDate}
                      </Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: 48, // space below drawer menu icon
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
    },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    tabsRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    tabBtn: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 2.5,
      borderBottomColor: "transparent",
    },
    tabBtnActive: {
      borderBottomColor: theme.colors.primary,
    },
    tabTextActive: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    tabTextInactive: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 110,
      gap: theme.spacing.lg,
    },
    upcomingCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    upcomingImageBox: {
      width: "100%",
      height: 175,
      backgroundColor: theme.colors.surfaceAlt,
    },
    upcomingImage: {
      width: "100%",
      height: "100%",
    },
    upcomingBody: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.md,
    },
    upcomingInfo: {
      flex: 1,
      gap: 6,
    },
    upcomingTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dateText: {
      fontSize: 13.5,
      color: theme.colors.textSecondary,
    },
    pastSection: {
      gap: theme.spacing.md,
    },
    pastSectionTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
    },
    pastCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      gap: 14,
    },
    pastThumb: {
      width: 68,
      height: 68,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceAlt,
    },
    pastInfo: {
      flex: 1,
      gap: 6,
    },
    pastTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
    },
    stateBox: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginTop: theme.spacing.xs,
    },
    stateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    planNowBtn: {
      marginTop: theme.spacing.sm,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: 12,
      borderRadius: theme.radius.pill,
    },
    planNowBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
