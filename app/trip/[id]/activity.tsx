import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { Activity, ActivityCategory } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";

const CATEGORIES: { label: string; value: ActivityCategory }[] = [
  { label: "Sightseeing", value: "landmark" },
  { label: "Food", value: "food" },
  { label: "Flights", value: "flight" },
  { label: "Hotel", value: "hotel" },
  { label: "Other", value: "other" },
];

const DAYS: number[] = [1, 2, 3, 4];

export default function AddActivityScreen() {
  const { id, day } = useLocalSearchParams<{ id: string; day?: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [dayNumber, setDayNumber] = useState<number>(Number(day) || 1);
  const [time, setTime] = useState<string>("10:00");
  const [category, setCategory] = useState<ActivityCategory>("landmark");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveActivity = async () => {
    if (!id) return;
    setError("");

    if (!title.trim()) {
      setError("Please enter an activity title.");
      return;
    }

    if (!time.trim()) {
      setError("Please enter a start time.");
      return;
    }

    const newActivity: Activity = {
      id: `act_${Date.now()}`,
      tripId: id,
      dayNumber,
      time: time.trim(),
      title: title.trim(),
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      category,
    };

    setIsSaving(true);
    try {
      await tripsRepo.createActivity(newActivity);
      router.back();
    } catch (err: any) {
      setError(err.message ?? "Failed to save activity.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flexBox}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Add Activity</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Activity Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Colosseum Tour"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.iconInputBox}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary}
              />
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Rome, Italy"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.iconInput}
              />
            </View>
          </View>

          <View style={styles.splitRow}>
            <View style={styles.splitBox}>
              <View style={styles.splitHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.splitLabel}>Day</Text>
              </View>
              <View style={styles.daysMiniRow}>
                {DAYS.map((d) => {
                  const active = dayNumber === d;
                  return (
                    <Pressable
                      key={d}
                      onPress={() => setDayNumber(d)}
                      style={[
                        styles.dayMiniChip,
                        active
                          ? styles.dayMiniChipActive
                          : styles.dayMiniChipInactive,
                      ]}
                    >
                      <Text
                        style={
                          active
                            ? styles.dayMiniTextActive
                            : styles.dayMiniTextInactive
                        }
                      >
                        {d}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.splitBox}>
              <View style={styles.splitHeader}>
                <Ionicons
                  name="time-outline"
                  size={15}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.splitLabel}>Start Time</Text>
              </View>
              <TextInput
                value={time}
                onChangeText={setTime}
                placeholder="10:00"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.timeInput}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                return (
                  <Pressable
                    key={cat.value}
                    onPress={() => setCategory(cat.value)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipActive : styles.chipInactive,
                    ]}
                  >
                    <Text
                      style={
                        isSelected
                          ? styles.chipTextActive
                          : styles.chipTextInactive
                      }
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add some notes..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              style={styles.notesInput}
            />
          </View>

          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleSaveActivity}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || isSaving) && styles.pressed,
            ]}
          >
            <Text style={styles.saveBtnText}>
              {isSaving ? "Saving..." : "Save Activity"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    flexBox: {
      flex: 1,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.pill,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
    },
    headerSpacer: {
      width: 40,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 60,
    },
    fieldGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 13.5,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    input: {
      height: 50,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      fontSize: 15.5,
      fontWeight: "600",
      color: theme.colors.text,
    },
    iconInputBox: {
      flexDirection: "row",
      alignItems: "center",
      height: 50,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      gap: 10,
    },
    iconInput: {
      flex: 1,
      fontSize: 15.5,
      fontWeight: "600",
      color: theme.colors.text,
    },
    splitRow: {
      flexDirection: "row",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    splitBox: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      gap: 8,
    },
    splitHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    splitLabel: {
      fontSize: 12.5,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    daysMiniRow: {
      flexDirection: "row",
      gap: 6,
    },
    dayMiniChip: {
      flex: 1,
      height: 30,
      borderRadius: theme.radius.sm,
      alignItems: "center",
      justifyContent: "center",
    },
    dayMiniChipActive: {
      backgroundColor: theme.colors.primary,
    },
    dayMiniChipInactive: {
      backgroundColor: theme.colors.surfaceAlt,
    },
    dayMiniTextActive: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    dayMiniTextInactive: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    timeInput: {
      height: 30,
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
      paddingVertical: 0,
    },
    chipsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
    },
    chipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    chipInactive: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
    },
    chipTextActive: {
      fontSize: 13.5,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    chipTextInactive: {
      fontSize: 13.5,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    notesInput: {
      minHeight: 80,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.colors.text,
      textAlignVertical: "top",
    },
    errorText: {
      fontSize: 13.5,
      fontWeight: "600",
      color: theme.colors.danger,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    saveBtn: {
      height: 54,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: theme.spacing.sm,
    },
    saveBtnText: {
      fontSize: 16.5,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
