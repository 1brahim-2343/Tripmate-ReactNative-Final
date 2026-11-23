import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { Destination } from "../../../src/types";
import {
  fetchDestinations,
  searchCitiesRemote,
} from "../../../src/services/api";

const INITIAL_REGION: Region = {
  latitude: 35.0116,
  longitude: 135.7681,
  latitudeDelta: 35,
  longitudeDelta: 35,
};

export default function MapScreen() {
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  useEffect(() => {
    fetchDestinations()
      .then((list) => {
        setDestinations(list);
        const kyoto = list.find((d) => d.id === "kyoto") ?? list[0] ?? null;
        setSelectedDestination(kyoto);
      })
      .catch((err) => console.error("Map load failed", err));
  }, []);

  const handleSearchOnMap = async () => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) return;

    setIsSearching(true);
    try {
      const results = await searchCitiesRemote(trimmed);
      if (results.length > 0) {
        const first = results[0];
        setDestinations((prev) => {
          const exists = prev.some((item) => item.id === first.id);
          return exists ? prev : [...prev, first];
        });
        setSelectedDestination(first);
        mapRef.current?.animateToRegion(
          {
            latitude: first.latitude,
            longitude: first.longitude,
            latitudeDelta: 4,
            longitudeDelta: 4,
          },
          600,
        );
      }
    } catch (err) {
      console.error("Map search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGoToMyLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Location Permission",
        "Please enable location permission to center the map on your position.",
      );
      return;
    }

    const pos = await Location.getCurrentPositionAsync({});
    mapRef.current?.animateToRegion(
      {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      },
      600,
    );
  };

  const handleSelectPin = (dest: Destination) => {
    setSelectedDestination(dest);
    mapRef.current?.animateToRegion(
      {
        latitude: dest.latitude,
        longitude: dest.longitude,
        latitudeDelta: 6,
        longitudeDelta: 6,
      },
      500,
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        userInterfaceStyle={isDark ? "dark" : "light"}
      >
        {destinations.map((dest) => (
          <Marker
            key={dest.id}
            coordinate={{
              latitude: dest.latitude,
              longitude: dest.longitude,
            }}
            title={dest.name}
            description={dest.country}
            pinColor={theme.colors.primary}
            onPress={() => handleSelectPin(dest)}
          />
        ))}
      </MapView>

      <View
        style={[
          styles.topBarRow,
          { top: Math.max(insets.top, theme.spacing.md) + 46 },
        ]}
      >
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchOnMap}
            placeholder="Search on map..."
            placeholderTextColor={theme.colors.textSecondary}
            returnKeyType="search"
            style={styles.searchInput}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color={theme.colors.primary} />
          ) : searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={handleSearchOnMap}
          style={({ pressed }) => [styles.filterBtn, pressed && styles.pressed]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={theme.colors.text}
          />
        </Pressable>
      </View>

      {selectedDestination && (
        <Pressable
          onPress={() => router.push(`/destination/${selectedDestination.id}`)}
          style={({ pressed }) => [
            styles.previewCard,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={{ uri: selectedDestination.imageUrl }}
            resizeMode="cover"
            style={styles.previewImage}
          />

          <View style={styles.previewInfo}>
            <Text numberOfLines={1} style={styles.previewTitle}>
              {selectedDestination.name}
            </Text>

            <View style={styles.previewMetaRow}>
              {selectedDestination.rating !== undefined ? (
                <>
                  <Ionicons
                    name="star"
                    size={14}
                    color={theme.colors.warning}
                  />
                  <Text style={styles.previewRating}>
                    {selectedDestination.rating.toFixed(1)}
                  </Text>
                </>
              ) : (
                <Text style={styles.previewCountry}>
                  {selectedDestination.country}
                </Text>
              )}
            </View>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textSecondary}
          />
        </Pressable>
      )}

      <Pressable
        onPress={handleGoToMyLocation}
        style={({ pressed }) => [styles.locateBtn, pressed && styles.pressed]}
      >
        <Ionicons name="locate" size={22} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    map: {
      width: "100%",
      height: "100%",
    },
    topBarRow: {
      position: "absolute",
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      height: 50,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: theme.colors.text,
    },
    filterBtn: {
      width: 50,
      height: 50,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    previewCard: {
      position: "absolute",
      left: theme.spacing.lg,
      right: 84,
      bottom: 110,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 10,
      gap: 12,
    },
    previewImage: {
      width: 62,
      height: 62,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceAlt,
    },
    previewInfo: {
      flex: 1,
      gap: 4,
    },
    previewTitle: {
      fontSize: 17,
      fontWeight: "800",
      color: theme.colors.text,
    },
    previewMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    previewRating: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
    previewCountry: {
      fontSize: 13.5,
      color: theme.colors.textSecondary,
    },
    locateBtn: {
      position: "absolute",
      right: theme.spacing.lg,
      bottom: 120,
      width: 50,
      height: 50,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    pressed: {
      opacity: 0.85,
    },
  });
