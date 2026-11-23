import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { Activity, ActivityCategory, Trip } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_ICONS: Record<ActivityCategory, IconName> = {
  flight: "airplane",
  landmark: "compass",
  food: "restaurant",
  hotel: "bed",
  other: "star",
};

function calculateTripDays(startDate?: string, endDate?: string): number[] {
  if (!startDate || !endDate) return [1];
  const start = Date.parse(startDate);
  const end = Date.parse(endDate);
  if (isNaN(start) || isNaN(end) || end < start) return [1, 2, 3];
  const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
  const count = Math.min(Math.max(diffDays, 1), 30);
  return Array.from({ length: count }, (_, i) => i + 1);
}

export default function TripItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadItinerary = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [tripData, list] = await Promise.all([
        tripsRepo.getTripById(id),
        tripsRepo.getActivitiesByTripId(id),
      ]);
      setTrip(tripData);
      setActivities(list);
    } catch (error) {
      console.error("Failed to load itinerary", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadItinerary();
    }, [loadItinerary]),
  );

  const days = useMemo<number[]>(() => {
    const calculated = calculateTripDays(trip?.startDate, trip?.endDate);
    const maxActivityDay = activities.reduce(
      (max, acttivts) => Math.max(max, acttivts.dayNumber),
      0,
    );
    if (maxActivityDay > calculated.length) {
      return Array.from({ length: maxActivityDay }, (_, i) => i + 1);
    }
    return calculated;
  }, [trip, activities]);

  const dayActivities = useMemo<Activity[]>(
    () => activities.filter((item) => item.dayNumber === selectedDay),
    [activities, selectedDay],
  );

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await tripsRepo.deleteActivity(activityId);
      setActivities((prev) => prev.filter((item) => item.id !== activityId));
    } catch (error) {
      console.error("Failed to delete activity", error);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Trip Itinerary</Text>

        <Pressable
          onPress={() => router.push(`/trip/${id}/edit`)}
          hitSlop={10}
          style={({ pressed }) => [styles.circleBtn, pressed && styles.pressed]}
        >
          <Ionicons name="pencil-outline" size={18} color={theme.colors.text} />
        </Pressable>
      </View>

      <View style={styles.daysWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysScroll}
        >
          {days.map((day) => {
            const isActive = selectedDay === day;
            return (
              <Pressable
                key={day}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayTab,
                  isActive ? styles.dayTabActive : styles.dayTabInactive,
                ]}
              >
                <Text
                  style={
                    isActive
                      ? styles.dayTabTextActive
                      : styles.dayTabTextInactive
                  }
                >
                  Day {day}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading itinerary...</Text>
        </View>
      ) : dayActivities.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons
            name="calendar-clear-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>
            No activities for Day {selectedDay}
          </Text>
          <Text style={styles.stateText}>
            Tap the button below to add flights, landmarks, food, or hotels.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.timelineList}
          showsVerticalScrollIndicator={false}
        >
          {dayActivities.map((item, index) => {
            const isLast = index === dayActivities.length - 1;
            const iconName = CATEGORY_ICONS[item.category] ?? "star";

            return (
              <View key={item.id} style={styles.timelineRow}>
                <View style={styles.timelineAxis}>
                  <View style={styles.timelineDot} />
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                <Text style={styles.timeText}>{item.time}</Text>

                <View style={styles.activityCard}>
                  <View style={styles.iconBadge}>
                    <Ionicons
                      name={iconName}
                      size={18}
                      color={theme.colors.primary}
                    />
                  </View>

                  <View style={styles.activityInfo}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    {Boolean(item.location) && (
                      <Text style={styles.activitySub}>{item.location}</Text>
                    )}
                    {Boolean(item.notes) && (
                      <Text style={styles.activityNotes}>{item.notes}</Text>
                    )}
                  </View>

                  <Pressable
                    onPress={() => handleDeleteActivity(item.id)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.bottomBar}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: `/trip/${id}/activity`,
              params: {
                day: String(selectedDay),
                totalDays: String(days.length),
              },
            })
          }
          style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
        >
          <Text style={styles.addBtnText}>Add Activity +</Text>
        </Pressable>
      </View>
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
      paddingTop: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
    },
    daysWrapper: {
      marginBottom: theme.spacing.xl,
    },
    daysScroll: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm,
    },
    dayTab: {
      paddingHorizontal: 22,
      height: 42,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    dayTabActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    dayTabInactive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    dayTabTextActive: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    dayTabTextInactive: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    timelineList: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 110,
    },
    timelineRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      minHeight: 74,
    },
    timelineAxis: {
      width: 24,
      alignItems: "center",
      alignSelf: "stretch",
    },
    timelineDot: {
      width: 14,
      height: 14,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      marginTop: 4,
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: theme.colors.border,
      marginVertical: 4,
    },
    timeText: {
      width: 54,
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
      marginLeft: 6,
      marginTop: 2,
    },
    activityCard: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      padding: 12,
      marginBottom: theme.spacing.md,
      gap: 12,
    },
    iconBadge: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
    },
    activityInfo: {
      flex: 1,
      gap: 2,
    },
    activityTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },
    activitySub: {
      fontSize: 12.5,
      color: theme.colors.textSecondary,
    },
    activityNotes: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    bottomBar: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    addBtn: {
      height: 54,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    addBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.surface,
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
    },
    stateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    pressed: {
      opacity: 0.85,
    },
  });
