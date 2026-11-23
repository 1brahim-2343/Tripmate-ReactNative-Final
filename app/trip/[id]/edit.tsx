import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { Trip } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";

const FALLBACK_TRIP_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [title, setTitle] = useState<string>("");
  const [destinationText, setDestinationText] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [budgetInput, setBudgetInput] = useState<string>("0");

  const [openRow, setOpenRow] = useState<"budget" | null>(null);

  const loadTrip = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const existing = await tripsRepo.getTripById(id);
      if (existing) {
        setTrip(existing);
        setTitle(existing.title);
        setDestinationText(
          existing.country
            ? `${existing.city}, ${existing.country}`
            : existing.city,
        );
        setStartDate(existing.startDate);
        setEndDate(existing.endDate);
        setBudgetInput(String(existing.totalBudget));
      } else {
        setError("Trip not found.");
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load trip.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const handleSaveChanges = async () => {
    if (!trip) return;
    setError("");

    if (!title.trim()) {
      setError("Trip name cannot be empty.");
      return;
    }

    const parts = destinationText.split(",");
    const updatedCity = parts[0]?.trim() || trip.city;
    const updatedCountry = parts[1]?.trim() || trip.country;

    if (!startDate.trim() || !endDate.trim()) {
      setError("Start date and end date are required.");
      return;
    }

    const parsedBudget = Number(budgetInput.replace(/[^0-9.]/g, "")) || 0;

    const updatedTrip: Trip = {
      ...trip,
      title: title.trim(),
      city: updatedCity,
      country: updatedCountry,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      totalBudget: parsedBudget,
    };

    setIsSaving(true);
    try {
      await tripsRepo.updateTrip(updatedTrip);
      router.back();
    } catch (err: any) {
      setError(err.message ?? "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.stateBox}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>Loading trip details...</Text>
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
        <Text style={styles.errorText}>{error || "Trip not found."}</Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
        >
          <Text style={styles.saveBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Edit Trip</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.bannerBox}>
            <Image
              source={{ uri: trip.coverImage || FALLBACK_TRIP_IMAGE }}
              resizeMode="cover"
              style={styles.bannerImage}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Trip Name</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Italy Adventure"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.textInput}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Destination</Text>
            <View style={styles.iconInputBox}>
              <Ionicons
                name="location-outline"
                size={20}
                color={theme.colors.primary}
              />
              <TextInput
                value={destinationText}
                onChangeText={setDestinationText}
                placeholder="Rome, Italy"
                placeholderTextColor={theme.colors.textSecondary}
                style={styles.iconTextInput}
              />
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.splitRow}>
            <View style={styles.dateCard}>
              <View style={styles.dateHeaderRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.dateLabel}>Start Date</Text>
              </View>
              <View style={styles.dateValueRow}>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="Jun 16, 2026"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.dateInput}
                />
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={theme.colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.dateCard}>
              <View style={styles.dateHeaderRow}>
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={theme.colors.textSecondary}
                />
                <Text style={styles.dateLabel}>End Date</Text>
              </View>
              <View style={styles.dateValueRow}>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="Jun 22, 2026"
                  placeholderTextColor={theme.colors.textSecondary}
                  style={styles.dateInput}
                />
                <Ionicons
                  name="chevron-forward"
                  size={15}
                  color={theme.colors.textSecondary}
                />
              </View>
            </View>
          </View>

          <View style={styles.rowsCard}>
            <View style={styles.rowDivider} />

            <Pressable
              onPress={() => setOpenRow(openRow === "budget" ? null : "budget")}
              style={styles.optionRow}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.rowLabel}>Budget</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  ${Number(budgetInput || 0).toLocaleString()}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            {openRow === "budget" && (
              <View style={styles.inlineEditor}>
                <TextInput
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder="1500"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                  autoFocus
                  style={styles.inlineInput}
                />
              </View>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleSaveChanges}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.saveBtn,
              (pressed || isSaving) && styles.pressed,
            ]}
          >
            <Text style={styles.saveBtnText}>
              {isSaving ? "Saving..." : "Save Changes"}
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
    bannerBox: {
      width: "100%",
      height: 155,
      borderRadius: theme.radius.lg,
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceAlt,
      marginBottom: theme.spacing.lg,
    },
    bannerImage: {
      width: "100%",
      height: "100%",
    },
    fieldGroup: {
      marginBottom: theme.spacing.md,
    },
    fieldLabel: {
      fontSize: 13.5,
      fontWeight: "600",
      color: theme.colors.textSecondary,
      marginBottom: 8,
    },
    textInput: {
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
    iconTextInput: {
      flex: 1,
      fontSize: 15.5,
      fontWeight: "600",
      color: theme.colors.text,
    },
    splitRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    dateCard: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 6,
    },
    dateHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    dateLabel: {
      fontSize: 12.5,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    dateValueRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dateInput: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: "700",
      color: theme.colors.text,
      paddingVertical: 2,
    },
    rowsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 54,
    },
    rowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    rowLabel: {
      fontSize: 15.5,
      fontWeight: "600",
      color: theme.colors.text,
    },
    rowRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    rowValue: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },
    rowDivider: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    stepperRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.lg,
      paddingBottom: 12,
    },
    stepperBtn: {
      width: 36,
      height: 36,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceAlt,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    stepperValue: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.colors.text,
    },
    inlineEditor: {
      paddingBottom: 12,
    },
    inlineInput: {
      height: 44,
      borderRadius: theme.radius.sm,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      fontSize: 15,
      color: theme.colors.text,
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
      paddingHorizontal: theme.spacing.xl,
    },
    saveBtnText: {
      fontSize: 16.5,
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
    pressed: {
      opacity: 0.85,
    },
  });
