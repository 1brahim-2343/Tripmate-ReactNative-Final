import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { CategoryFilter, Destination } from "../../../src/types";
import {
  fetchDestinations,
  searchCitiesRemote,
} from "../../../src/services/api";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const CATEGORY_CHIPS: { label: CategoryFilter; icon: IconName }[] = [
  { label: "All", icon: "grid-outline" },
  { label: "Beach", icon: "sunny-outline" },
  { label: "Cities", icon: "business-outline" },
  { label: "Nature", icon: "leaf-outline" },
];

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [remoteResults, setRemoteResults] = useState<Destination[] | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const loadFeaturedDestinations = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchDestinations();
      setDestinations(data);
    } catch (err: any) {
      setError(err.message ?? "Failed to load destinations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedDestinations();
  }, [loadFeaturedDestinations]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setRemoteResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchCitiesRemote(trimmed);
        setRemoteResults(results);
      } catch {
        setRemoteResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  const displayedDestinations = useMemo<Destination[]>(() => {
    const sourceList = remoteResults ?? destinations;
    if (selectedCategory === "All") {
      return sourceList;
    }
    return sourceList.filter((item) => item.category === selectedCategory);
  }, [remoteResults, destinations, selectedCategory]);

  const handleOpenDestination = (destination: Destination) => {
    router.push(`/destination/${destination.id}`);
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Greeting Header (leaves room at top-left for Drawer menu button) */}
        <View style={styles.headerRow}>
          <View style={styles.greetingBox}>
            <Text style={styles.greetingTitle}>Hello, Traveler! 👋</Text>
            <Text style={styles.greetingSubtitle}>Where will you go next?</Text>
          </View>

          <Pressable
            onPress={() => router.push("/(drawer)/(tabs)/profile")}
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons name="person" size={20} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View
          style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={
              isSearchFocused
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search destinations..."
            placeholderTextColor={theme.colors.textSecondary}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          )}
        </View>

        {/* Category chips part */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {CATEGORY_CHIPS.map((chip) => {
            const isSelected = selectedCategory === chip.label;
            return (
              <Pressable
                key={chip.label}
                onPress={() => setSelectedCategory(chip.label)}
                style={({ pressed }) => [
                  styles.chip,
                  isSelected ? styles.chipActive : styles.chipInactive,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={chip.icon}
                  size={16}
                  color={
                    isSelected
                      ? theme.colors.surface
                      : theme.colors.textSecondary
                  }
                />
                <Text
                  style={
                    isSelected ? styles.chipTextActive : styles.chipTextInactive
                  }
                >
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Section Header: Featured Destinations + See all -> */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {remoteResults ? "Search Results" : "Featured Destinations"}
          </Text>
          <Pressable
            onPress={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            style={styles.seeAllButton}
          >
            <Text style={styles.seeAllText}>See all</Text>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={theme.colors.primary}
            />
          </Pressable>
        </View>

        {isLoading || isSearching ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.stateText}>
              {isSearching
                ? "Searching worldwide cities..."
                : "Loading destinations..."}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Ionicons
              name="alert-circle-outline"
              size={40}
              color={theme.colors.danger}
            />
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              onPress={loadFeaturedDestinations}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : displayedDestinations.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons
              name="compass-outline"
              size={44}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>No destinations found</Text>
            <Text style={styles.stateText}>
              Try selecting another category or searching a different city name.
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayedDestinations}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleOpenDestination(item)}
                style={({ pressed }) => [
                  styles.cardWrapper,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.cardImage}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    resizeMode="cover"
                    style={styles.cardCoverImage}
                  />

                  {/* Toppest (flag&temprature) */}
                  <View style={styles.cardTopRow}>
                    <View style={styles.flagBadge}>
                      <Image
                        source={{ uri: item.flagUrl }}
                        resizeMode="cover"
                        style={styles.flagIcon}
                      />
                      <Text style={styles.flagCodeText}>
                        {item.countryCode}
                      </Text>
                    </View>

                    {item.weather && (
                      <View style={styles.weatherBadge}>
                        <Ionicons
                          name={item.weather.isDay ? "sunny" : "moon"}
                          size={13}
                          color={theme.colors.warning}
                        />
                        <Text style={styles.weatherText}>
                          {Math.round(item.weather.temperature)}°C
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Bottom starts here */}
                  <LinearGradient
                    colors={["transparent", "rgba(15, 23, 42, 0.88)"]}
                    style={styles.cardGradient}
                  >
                    <Text numberOfLines={1} style={styles.cardTitle}>
                      {item.name}
                    </Text>

                    <View style={styles.cardLocationRow}>
                      <View style={styles.locationLeft}>
                        <Ionicons
                          name="location"
                          size={13}
                          color={theme.colors.surface}
                        />
                        <Text numberOfLines={1} style={styles.cardCountryText}>
                          {item.country}
                        </Text>
                      </View>

                      {item.rating !== undefined && (
                        <View style={styles.ratingRow}>
                          <Ionicons
                            name="star"
                            size={12}
                            color={theme.colors.warning}
                          />
                          <Text style={styles.ratingText}>
                            {item.rating.toFixed(1)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </LinearGradient>
                </View>
              </Pressable>
            )}
          />
        )}
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
      paddingTop: 56, // space below the transparent Drawer hamburger button
      paddingBottom: 110,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    greetingBox: {
      flex: 1,
    },
    greetingTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 6,
    },
    greetingSubtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    avatarButton: {
      width: 48,
      height: 48,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.pill,
      marginHorizontal: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      height: 54,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
    },
    searchBarFocused: {
      borderColor: theme.colors.primary,
    },
    searchInput: {
      flex: 1,
      fontSize: 15.5,
      color: theme.colors.text,
    },
    chipsScroll: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm + 2,
      marginBottom: theme.spacing.xl,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 18,
      height: 42,
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
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    chipTextInactive: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 21,
      fontWeight: "800",
      color: theme.colors.text,
    },
    seeAllButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    seeAllText: {
      fontSize: 14.5,
      fontWeight: "600",
      color: theme.colors.primary,
    },
    cardsList: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    cardWrapper: {
      width: 195,
      height: 360,
      borderRadius: theme.radius.lg,
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceAlt,
    },
    cardImage: {
      flex: 1,
      justifyContent: "space-between",
    },
    cardCoverImage: {
      position: "absolute",
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: "100%",
      height: "100%",
    },
    cardTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
    },
    flagBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: theme.radius.pill,
    },
    flagIcon: {
      width: 16,
      height: 11,
      borderRadius: 2,
    },
    flagCodeText: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    weatherBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(15, 23, 42, 0.65)",
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: theme.radius.pill,
    },
    weatherText: {
      fontSize: 11,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    cardGradient: {
      paddingHorizontal: 16,
      paddingBottom: 18,
      paddingTop: 48,
      borderBottomLeftRadius: theme.radius.lg,
      borderBottomRightRadius: theme.radius.lg,
    },
    cardTitle: {
      fontSize: 22,
      fontWeight: "800",
      color: theme.colors.surface,
      marginBottom: 6,
    },
    cardLocationRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    locationLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      flex: 1,
    },
    cardCountryText: {
      fontSize: 13.5,
      fontWeight: "600",
      color: theme.colors.surface,
      opacity: 0.9,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    stateBox: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 64,
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    stateText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: theme.colors.text,
    },
    errorText: {
      fontSize: 14,
      color: theme.colors.danger,
      textAlign: "center",
    },
    retryButton: {
      marginTop: theme.spacing.xs,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radius.md,
    },
    retryButtonText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
