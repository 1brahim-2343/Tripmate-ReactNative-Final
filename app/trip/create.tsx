import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AppTheme } from "../../src/theme/theme";
import { Destination, Trip } from "../../src/types";
import { searchCitiesRemote } from "../../src/services/api";
import { tripsRepo } from "../../src/database/trips.repo";

const DEFAULT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80";

export default function CreateTripScreen() {
  const params = useLocalSearchParams<{
    destinationId?: string;
    city?: string;
    country?: string;
    coverImage?: string;
  }>();

  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const initialCity = params.city ?? "";
  const initialCountry = params.country ?? "";

  const [destinationId, setDestinationId] = useState<string | undefined>(
    params.destinationId,
  );
  const [city, setCity] = useState<string>(initialCity);
  const [country, setCountry] = useState<string>(initialCountry);
  const [coverImage, setCoverImage] = useState<string>(
    params.coverImage || DEFAULT_COVER_IMAGE,
  );

  const [searchQuery, setSearchQuery] = useState<string>(
    initialCity && initialCountry
      ? `${initialCity}, ${initialCountry}`
      : initialCity,
  );
  const [suggestions, setSuggestions] = useState<Destination[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const [tripTitle, setTripTitle] = useState<string>(
    initialCity ? `${initialCity} Adventure` : "",
  );
  const [startDate, setStartDate] = useState<string>("2026-06-15");
  const [endDate, setEndDate] = useState<string>("2026-06-23");
  const [travelers, setTravelers] = useState<number>(2);
  const [budgetInput, setBudgetInput] = useState<string>("1500");

  const [activeField, setActiveField] = useState<
    "title" | "startDate" | "endDate" | "travelers" | "budget" | null
  >(null);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (!showSuggestions) return;
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCitiesRemote(trimmed);
        setSuggestions(results.slice(0, 4));
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, showSuggestions]);

  const handleSelectSuggestion = (dest: Destination) => {
    setDestinationId(dest.id);
    setCity(dest.name);
    setCountry(dest.country);
    setCoverImage(dest.imageUrl);
    setSearchQuery(`${dest.name}, ${dest.country}`);
    setTripTitle(`${dest.name} Adventure`);
    setShowSuggestions(false);
    setSuggestions([]);
    setError("");
  };

  const handleCreateTrip = async () => {
    const resolvedCity = city.trim() || searchQuery.split(",")[0]?.trim() || "";
    const resolvedCountry =
      country.trim() || searchQuery.split(",")[1]?.trim() || "Destination";

    if (resolvedCity.length < 2) {
      Alert.alert(
        "Missing Destination",
        "Please search or enter a valid destination city first.",
      );
      return;
    }

    const trimmedStart = startDate.trim();
    const trimmedEnd = endDate.trim();

    if (!trimmedStart || !trimmedEnd) {
      Alert.alert(
        "Missing Dates",
        "Please enter both a start date and an end date.",
      );
      return;
    }

    const startTimestamp = Date.parse(trimmedStart);
    const endTimestamp = Date.parse(trimmedEnd);

    if (Number.isNaN(startTimestamp) || Number.isNaN(endTimestamp)) {
      Alert.alert(
        "Invalid Date Format",
        "Please enter valid dates (for example: 2026-06-15).",
      );
      return;
    }

    if (endTimestamp < startTimestamp) {
      Alert.alert(
        "Invalid Date Range",
        "End date cannot be earlier than the start date.",
      );
      return;
    }

    const parsedBudget = Number(budgetInput.trim());
    if (
      !budgetInput.trim() ||
      Number.isNaN(parsedBudget) ||
      parsedBudget <= 0
    ) {
      Alert.alert(
        "Invalid Budget",
        "Please enter a valid budget amount greater than $0.",
      );
      return;
    }

    const finalTitle = tripTitle.trim() || `${resolvedCity} Adventure`;
    const isPastTrip = endTimestamp < Date.now();

    const newTrip: Trip = {
      id: `trip_${Date.now()}`,
      title: finalTitle,
      destinationId,
      city: resolvedCity,
      country: resolvedCountry,
      coverImage,
      startDate: trimmedStart,
      endDate: trimmedEnd,
      totalBudget: parsedBudget,
      status: isPastTrip ? "past" : "upcoming",
      createdAt: new Date().toISOString(),
    };

    setIsSaving(true);
    try {
      await tripsRepo.createTrip(newTrip);
      router.replace("/(drawer)/(tabs)/trips");
    } catch (err: any) {
      Alert.alert(
        "Failed to Create Trip",
        err.message ?? "Something went wrong while saving your trip.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View
        style={[
          styles.headerRow,
          { paddingTop: Math.max(insets.top, theme.spacing.md) },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Trip</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.coverBox}>
          <Image
            source={{ uri: coverImage }}
            resizeMode="cover"
            style={styles.coverImage}
          />
        </View>

        <View style={styles.formSheet}>
          <View style={styles.searchBar}>
            <Ionicons
              name="search-outline"
              size={20}
              color={theme.colors.textSecondary}
            />
            <TextInput
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                setCity("");
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search destination..."
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.searchInput}
            />
            {isSearching && (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            )}
            {searchQuery.length > 0 && !isSearching && (
              <Pressable
                onPress={() => {
                  setSearchQuery("");
                  setCity("");
                  setCountry("");
                  setSuggestions([]);
                }}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </Pressable>
            )}
          </View>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsBox}>
              {suggestions.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectSuggestion(item)}
                  style={({ pressed }) => [
                    styles.suggestionRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    source={{ uri: item.flagUrl }}
                    resizeMode="cover"
                    style={styles.flagIcon}
                  />
                  <Text numberOfLines={1} style={styles.suggestionText}>
                    {item.name}, {item.country}
                  </Text>
                  <Ionicons
                    name="arrow-up-outline"
                    size={16}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              ))}
            </View>
          )}

          {/* Rows container */}
          <View style={styles.rowsCard}>
            {/* Trip Title */}
            <Pressable
              onPress={() =>
                setActiveField(activeField === "title" ? null : "title")
              }
              style={styles.optionRow}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.rowLabel}>Trip Name</Text>
              </View>
              <View style={styles.rowRight}>
                <Text numberOfLines={1} style={styles.rowValue}>
                  {tripTitle || "Tap to set"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            {activeField === "title" && (
              <View style={styles.inlineEditor}>
                <TextInput
                  value={tripTitle}
                  onChangeText={setTripTitle}
                  placeholder="e.g. Italy Adventure"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                  style={styles.inlineInput}
                />
              </View>
            )}

            <View style={styles.rowDivider} />

            {/* Start Date */}
            <Pressable
              onPress={() =>
                setActiveField(activeField === "startDate" ? null : "startDate")
              }
              style={styles.optionRow}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.rowLabel}>Start Date</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{startDate}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            {activeField === "startDate" && (
              <View style={styles.inlineEditor}>
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="e.g. 2026-06-15"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                  style={styles.inlineInput}
                />
              </View>
            )}

            <View style={styles.rowDivider} />

            {/* End Date */}
            <Pressable
              onPress={() =>
                setActiveField(activeField === "endDate" ? null : "endDate")
              }
              style={styles.optionRow}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.rowLabel}>End Date</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>{endDate}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            {activeField === "endDate" && (
              <View style={styles.inlineEditor}>
                <TextInput
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="e.g. Jun 22, 2026"
                  placeholderTextColor={theme.colors.textSecondary}
                  autoFocus
                  style={styles.inlineInput}
                />
              </View>
            )}

            <View style={styles.rowDivider} />

            {/* Travelers */}
            <Pressable
              onPress={() =>
                setActiveField(activeField === "travelers" ? null : "travelers")
              }
              style={styles.optionRow}
            >
              <View style={styles.rowLeft}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.rowLabel}>Travelers</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowValue}>
                  {travelers} {travelers === 1 ? "person" : "people"}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </View>
            </Pressable>

            {activeField === "travelers" && (
              <View style={styles.stepperRow}>
                <Pressable
                  onPress={() => setTravelers((prev) => Math.max(1, prev - 1))}
                  style={styles.stepperBtn}
                >
                  <Ionicons name="remove" size={18} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.stepperValue}>
                  {travelers} {travelers === 1 ? "traveler" : "travelers"}
                </Text>
                <Pressable
                  onPress={() => setTravelers((prev) => prev + 1)}
                  style={styles.stepperBtn}
                >
                  <Ionicons name="add" size={18} color={theme.colors.text} />
                </Pressable>
              </View>
            )}

            <View style={styles.rowDivider} />

            {/* Budget */}
            <Pressable
              onPress={() =>
                setActiveField(activeField === "budget" ? null : "budget")
              }
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

            {activeField === "budget" && (
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

          {/* Bottom Create BTN */}
          <Pressable
            onPress={handleCreateTrip}
            disabled={isSaving}
            style={({ pressed }) => [
              styles.createBtn,
              (pressed || isSaving) && styles.pressed,
            ]}
          >
            <Text style={styles.createBtnText}>Create Trip</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
      paddingBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
    },
    backBtn: {
      width: 38,
      height: 38,
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
      width: 38,
    },
    scrollContent: {
      paddingBottom: 60,
    },
    coverBox: {
      width: "100%",
      height: 210,
      backgroundColor: theme.colors.surfaceAlt,
    },
    coverImage: {
      width: "100%",
      height: "100%",
    },
    formSheet: {
      marginTop: -24,
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.md,
      height: 50,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
    },
    suggestionsBox: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      marginBottom: theme.spacing.md,
      overflow: "hidden",
    },
    suggestionRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      gap: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    flagIcon: {
      width: 18,
      height: 13,
      borderRadius: 2,
    },
    suggestionText: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: "600",
      color: theme.colors.text,
    },
    rowsCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    optionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      height: 56,
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
      maxWidth: "55%",
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
    errorText: {
      fontSize: 13.5,
      fontWeight: "600",
      color: theme.colors.danger,
      textAlign: "center",
      marginBottom: theme.spacing.md,
    },
    createBtn: {
      height: 54,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    createBtnText: {
      fontSize: 16.5,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
