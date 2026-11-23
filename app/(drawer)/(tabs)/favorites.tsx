import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { Destination } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";
import { fetchDestinationById } from "../../../src/services/api";

export default function FavoritesScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [favorites, setFavorites] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    try {
      const ids = await tripsRepo.getFavoriteIds();
      const results = await Promise.all(
        ids.map((id) => fetchDestinationById(id)),
      );
      setFavorites(results.filter((item) => item !== null));
    } catch (error) {
      console.error("Failed to load favorites", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const handleRemoveFavorite = async (destinationId: string) => {
    try {
      await tripsRepo.toggleFavorite(destinationId);
      setFavorites((prev) => prev.filter((item) => item.id !== destinationId));
    } catch (error) {
      console.error("Failed to remove favorite", error);
    }
  };

  const trimmed = searchQuery.trim().toLowerCase();
  const filteredFavorites: Destination[] = trimmed
    ? favorites.filter(
        (item) =>
          item.name.toLowerCase().includes(trimmed) ||
          item.country.toLowerCase().includes(trimmed),
      )
    : favorites;

  return (
    <SafeAreaView edges={["top"]} style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.headerTitle}>Favorites</Text>

        <Pressable
          onPress={() => {
            setSearchOpen((prev) => !prev);
            if (searchOpen) setSearchQuery("");
          }}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons
            name={searchOpen ? "close" : "search-outline"}
            size={22}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      {searchOpen && (
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={theme.colors.textSecondary}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Filter saved places..."
            placeholderTextColor={theme.colors.textSecondary}
            autoFocus
            style={styles.searchInput}
          />
        </View>
      )}

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading favorites...</Text>
        </View>
      ) : filteredFavorites.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons
            name="heart-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>
            {searchQuery.trim()
              ? "No matching favorites"
              : "No favorites saved yet"}
          </Text>
          <Text style={styles.stateText}>
            {searchQuery.trim()
              ? "Try a different search term."
              : "Tap the heart icon on any destination to save it here."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/destination/${item.id}`)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.imageBox}>
                <Image
                  source={{ uri: item.imageUrl }}
                  resizeMode="cover"
                  style={styles.cardImage}
                />
                <Pressable
                  onPress={() => handleRemoveFavorite(item.id)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.heartBadge,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name="heart"
                    size={16}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>

              <View style={styles.cardBody}>
                <Text numberOfLines={1} style={styles.cityName}>
                  {item.name}
                </Text>

                <View style={styles.countryRow}>
                  <Text numberOfLines={1} style={styles.countryName}>
                    {item.country}
                  </Text>
                  <Image
                    source={{ uri: item.flagUrl }}
                    resizeMode="cover"
                    style={styles.flagIcon}
                  />
                </View>

                <View style={styles.metaRow}>
                  {item.rating !== undefined ? (
                    <>
                      <Ionicons
                        name="star"
                        size={14}
                        color={theme.colors.warning}
                      />
                      <Text style={styles.ratingText}>
                        {item.rating.toFixed(1)}
                      </Text>
                    </>
                  ) : item.weather ? (
                    <>
                      <Ionicons
                        name={item.weather.isDay ? "sunny" : "moon"}
                        size={14}
                        color={theme.colors.warning}
                      />
                      <Text style={styles.ratingText}>
                        {Math.round(item.weather.temperature)}°C
                      </Text>
                    </>
                  ) : null}
                </View>
              </View>
            </Pressable>
          )}
        />
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
      paddingTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    iconBtn: {
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
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: theme.radius.pill,
      marginHorizontal: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      height: 46,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
    },
    gridContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xs,
      paddingBottom: 110,
      gap: theme.spacing.md,
    },
    gridRow: {
      justifyContent: "space-between",
      gap: theme.spacing.md,
    },
    card: {
      flex: 1,
      maxWidth: "48%",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
    },
    imageBox: {
      width: "100%",
      height: 135,
      backgroundColor: theme.colors.surfaceAlt,
    },
    cardImage: {
      width: "100%",
      height: "100%",
    },
    heartBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 30,
      height: 30,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    cardBody: {
      padding: 12,
    },
    cityName: {
      fontSize: 16.5,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 2,
    },
    countryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 8,
    },
    countryName: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      flexShrink: 1,
    },
    flagIcon: {
      width: 15,
      height: 11,
      borderRadius: 2,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      minHeight: 18,
    },
    ratingText: {
      fontSize: 13.5,
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
    pressed: {
      opacity: 0.85,
    },
  });
