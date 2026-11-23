import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AppTheme } from "../../src/theme/theme";
import { Destination } from "../../src/types";
import { fetchDestinationById } from "../../src/services/api";
import { tripsRepo } from "../../src/database/trips.repo";

export default function DestinationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadDestination = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError("");
    try {
      const [destData, favStatus] = await Promise.all([
        fetchDestinationById(id),
        tripsRepo.isFavorite(id),
      ]);

      if (!destData) {
        setError("Destination not found.");
      } else {
        setDestination(destData);
        setIsFavorite(favStatus);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load destination details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDestination();
  }, [loadDestination]);

  const handleToggleFavorite = async () => {
    if (!destination) return;
    try {
      const nextState = await tripsRepo.toggleFavorite(destination.id);
      setIsFavorite(nextState);
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  const handlePlanTrip = () => {
    if (!destination) return;
    router.push({
      pathname: "/trip/create",
      params: {
        destinationId: destination.id,
        city: destination.name,
        country: destination.country,
        coverImage: destination.imageUrl,
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.stateText}>Loading destination...</Text>
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={styles.stateContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={44}
          color={theme.colors.danger}
        />
        <Text style={styles.errorText}>
          {error || "Destination not found."}
        </Text>
        <View style={styles.errorButtonsRow}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Go Back</Text>
          </Pressable>
          <Pressable
            onPress={loadDestination}
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
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
        {/* Top Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: destination.imageUrl }}
            resizeMode="cover"
            style={styles.topImage}
          />

          {/* Top buttons*/}
          <View
            style={[
              styles.topActionsRow,
              { top: Math.max(insets.top, theme.spacing.md) + 6 },
            ]}
          >
            <Pressable
              onPress={() => router.back()}
              hitSlop={10}
              style={({ pressed }) => [
                styles.circleActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
            </Pressable>

            <Pressable
              onPress={handleToggleFavorite}
              hitSlop={10}
              style={({ pressed }) => [
                styles.circleActionButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={22}
                color={isFavorite ? theme.colors.danger : theme.colors.text}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.contentSheet}>
          {/* Country & weather details */}
          <View style={styles.titleRow}>
            <View style={styles.titleLeft}>
              <Text style={styles.cityName}>{destination.name}</Text>

              <View style={styles.locationRow}>
                <Ionicons
                  name="location"
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.countryName}>{destination.country}</Text>
                <Image
                  source={{ uri: destination.flagUrl }}
                  resizeMode="cover"
                  style={styles.flagIcon}
                />
                {destination.weather && (
                  <View style={styles.weatherChip}>
                    <Ionicons
                      name={destination.weather.isDay ? "sunny" : "moon"}
                      size={13}
                      color={theme.colors.warning}
                    />
                    <Text style={styles.weatherChipText}>
                      {Math.round(destination.weather.temperature)}°C
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {destination.rating !== undefined && (
              <View style={styles.ratingBox}>
                <View style={styles.ratingTopRow}>
                  <Ionicons
                    name="star"
                    size={18}
                    color={theme.colors.warning}
                  />
                  <Text style={styles.ratingValue}>
                    {destination.rating.toFixed(1)}
                  </Text>
                </View>
                {destination.reviewsCount && (
                  <Text style={styles.reviewsText}>
                    ({destination.reviewsCount})
                  </Text>
                )}
              </View>
            )}
          </View>

          <Text style={styles.descriptionText}>{destination.description}</Text>

          {/* Highlights */}
          {destination.highlights.length > 0 && (
            <View style={styles.highlightsSection}>
              <Text style={styles.sectionTitle}>Highlights</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.highlightsScroll}
              >
                {destination.highlights.map((highlight) => (
                  <View key={highlight.id} style={styles.highlightCard}>
                    <Image
                      source={{ uri: highlight.imageUrl }}
                      resizeMode="cover"
                      style={styles.highlightImage}
                    />
                    <View style={styles.highlightTitleBox}>
                      <Text numberOfLines={2} style={styles.highlightTitleText}>
                        {highlight.title}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* BTN "Plan a trip ->" */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, theme.spacing.md) },
        ]}
      >
        <Pressable
          onPress={handlePlanTrip}
          style={({ pressed }) => [
            styles.planTripButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.planTripButtonText}>Plan a trip</Text>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={theme.colors.surface}
          />
        </Pressable>
      </View>
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
      paddingBottom: 120,
    },
    imageContainer: {
      width: "100%",
      height: 350,
      backgroundColor: theme.colors.surfaceAlt,
    },
    topImage: {
      width: "100%",
      height: "100%",
    },
    topActionsRow: {
      position: "absolute",
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    circleActionButton: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    contentSheet: {
      marginTop: -28,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      backgroundColor: theme.colors.background,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    titleLeft: {
      flex: 1,
    },
    cityName: {
      fontSize: 30,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 6,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 6,
    },
    countryName: {
      fontSize: 15.5,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    flagIcon: {
      width: 18,
      height: 13,
      borderRadius: 2,
    },
    weatherChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radius.pill,
      marginLeft: 4,
    },
    weatherChipText: {
      fontSize: 12,
      fontWeight: "700",
      color: theme.colors.text,
    },
    ratingBox: {
      alignItems: "flex-end",
      paddingTop: 4,
    },
    ratingTopRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginBottom: 2,
    },
    ratingValue: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
    },
    reviewsText: {
      fontSize: 12.5,
      color: theme.colors.textSecondary,
    },
    descriptionText: {
      fontSize: 15.5,
      lineHeight: 24,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xl,
    },
    highlightsSection: {
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    highlightsScroll: {
      gap: theme.spacing.md,
    },
    highlightCard: {
      width: 120,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    highlightImage: {
      width: "100%",
      height: 92,
      backgroundColor: theme.colors.surfaceAlt,
    },
    highlightTitleBox: {
      paddingHorizontal: 8,
      paddingVertical: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    highlightTitleText: {
      fontSize: 12.5,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      lineHeight: 17,
    },
    bottomBar: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
    },
    planTripButton: {
      height: 54,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    planTripButtonText: {
      fontSize: 16.5,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    stateContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    stateText: {
      fontSize: 14.5,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    errorText: {
      fontSize: 15,
      color: theme.colors.danger,
      textAlign: "center",
      marginBottom: theme.spacing.sm,
    },
    errorButtonsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.md,
    },
    secondaryButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm + 2,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    secondaryButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
    },
    retryButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm + 2,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
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
