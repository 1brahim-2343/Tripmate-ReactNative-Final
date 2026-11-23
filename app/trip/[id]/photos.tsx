import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../../src/contexts/ThemeContext";
import { AppTheme } from "../../../src/theme/theme";
import { JournalEntry, Trip } from "../../../src/types";
import { tripsRepo } from "../../../src/database/trips.repo";
import { journalRepo } from "../../../src/database/journal.repo";
import { fetchDestinationById } from "../../../src/services/api";

export default function TripPhotosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [photos, setPhotos] = useState<
    { id: string; uri: string; isCustom: boolean }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadPhotos = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [tripData, savedPhotos] = await Promise.all([
        tripsRepo.getTripById(id),
        journalRepo.getPhotosByTripId(id),
      ]);
      setTrip(tripData);

      const customList = savedPhotos
        .filter((entry) => Boolean(entry.imageUri))
        .map((entry) => ({
          id: entry.id,
          uri: entry.imageUri as string,
          isCustom: true,
        }));

      const defaultList: { id: string; uri: string; isCustom: boolean }[] = [];
      if (tripData?.coverImage) {
        defaultList.push({
          id: "cover_img",
          uri: tripData.coverImage,
          isCustom: false,
        });
      }

      if (tripData?.destinationId) {
        const dest = await fetchDestinationById(tripData.destinationId);
        if (dest?.highlights) {
          dest.highlights.forEach((h) => {
            defaultList.push({
              id: `hl_${h.id}`,
              uri: h.imageUrl,
              isCustom: false,
            });
          });
        }
      }

      setPhotos([...customList, ...defaultList]);
    } catch (error) {
      console.error("Failed to load trip photos", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPhotos();
    }, [loadPhotos]),
  );

  const handleAddPhoto = async () => {
    if (!id) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to add trip photos.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const newEntry: JournalEntry = {
        id: `photo_${Date.now()}`,
        tripId: id,
        title: "__TRIP_PHOTO__",
        content: "",
        imageUri: uri,
        createdAt: new Date().toISOString(),
      };
      await journalRepo.createEntry(newEntry);
      setPhotos((prev) => [{ id: newEntry.id, uri, isCustom: true }, ...prev]);
    }
  };

  const handleDeletePhoto = (photoId: string, isCustom: boolean) => {
    if (!isCustom) return;
    Alert.alert("Remove Photo", "Delete this photo from your trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await journalRepo.deleteEntry(photoId);
          setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        },
      },
    ]);
  };

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

        <Text style={styles.headerTitle}>Trip Photos</Text>

        <Pressable
          onPress={handleAddPhoto}
          hitSlop={10}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
        >
          <Ionicons
            name="add-circle-outline"
            size={26}
            color={theme.colors.primary}
          />
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.stateText}>Loading photos...</Text>
        </View>
      ) : photos.length === 0 ? (
        <View style={styles.stateBox}>
          <Ionicons
            name="images-outline"
            size={48}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.emptyTitle}>No photos yet</Text>
          <Text style={styles.stateText}>
            Tap Add Photos below to upload memories from your gallery.
          </Text>
        </View>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <Pressable
              onLongPress={() => handleDeletePhoto(item.id, item.isCustom)}
              style={styles.photoTile}
            >
              <Image
                source={{ uri: item.uri }}
                resizeMode="cover"
                style={styles.photoImage}
              />
              {item.isCustom && (
                <Pressable
                  onPress={() => handleDeletePhoto(item.id, item.isCustom)}
                  style={styles.deleteBadge}
                >
                  <Ionicons
                    name="close"
                    size={14}
                    color={theme.colors.surface}
                  />
                </Pressable>
              )}
            </Pressable>
          )}
        />
      )}

      <View style={styles.bottomSection}>
        <Pressable
          onPress={handleAddPhoto}
          style={({ pressed }) => [
            styles.addPhotosBtn,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="camera-outline"
            size={20}
            color={theme.colors.primary}
          />
          <Text style={styles.addPhotosBtnText}>Add Photos</Text>
        </Pressable>

        <Text style={styles.footerCaption}>
          {trip?.title ?? "Trip"} • {photos.length}{" "}
          {photos.length === 1 ? "photo" : "photos"}
        </Text>
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
    gridContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      gap: 12,
    },
    gridRow: {
      justifyContent: "space-between",
      gap: 12,
    },
    photoTile: {
      flex: 1,
      maxWidth: "48.5%",
      aspectRatio: 1,
      borderRadius: theme.radius.md,
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceAlt,
    },
    photoImage: {
      width: "100%",
      height: "100%",
    },
    deleteBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 24,
      height: 24,
      borderRadius: theme.radius.pill,
      backgroundColor: "rgba(15, 23, 42, 0.7)",
      alignItems: "center",
      justifyContent: "center",
    },
    bottomSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      alignItems: "center",
      gap: 10,
    },
    addPhotosBtn: {
      width: "100%",
      height: 50,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    addPhotosBtnText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    footerCaption: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.textSecondary,
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
