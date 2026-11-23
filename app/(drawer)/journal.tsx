import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AppTheme } from "../../src/theme/theme";
import { JournalEntry } from "../../src/types";
import { journalRepo } from "../../src/database/journal.repo";

const DEFAULT_JOURNAL_IMAGE =
  "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80";

export default function TravelJournalScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await journalRepo.getAllEntries();
      setEntries(list);
    } catch (error) {
      console.error("Failed to load journal entries", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries]),
  );

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow photo library access to attach a photo.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSaveEntry = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing Info", "Please enter both a title and your story.");
      return;
    }

    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newEntry: JournalEntry = {
      id: `jrnl_${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      imageUri: imageUri || DEFAULT_JOURNAL_IMAGE,
      createdAt: formattedDate,
    };

    try {
      await journalRepo.createEntry(newEntry);
      setEntries((prev) => [newEntry, ...prev]);
      setTitle("");
      setContent("");
      setImageUri(undefined);
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to save journal entry", error);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert("Delete Entry", "Remove this journal memory?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await journalRepo.deleteEntry(entryId);
          setEntries((prev) => prev.filter((item) => item.id !== entryId));
        },
      },
    ]);
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
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.colors.text} />
          </Pressable>

          <Text style={styles.headerTitle}>Travel Journal</Text>
          <View style={styles.headerSpacer} />
        </View>

        {isCreating && (
          <View style={styles.formCard}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="A perfect day in Positano"
              placeholderTextColor={theme.colors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write your travel memory..."
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              style={styles.textArea}
            />
            <View style={styles.formActionsRow}>
              <Pressable
                onPress={handlePickPhoto}
                style={({ pressed }) => [
                  styles.photoPickerBtn,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="image-outline"
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={styles.photoPickerText}>
                  {imageUri ? "Photo Selected" : "Attach Photo"}
                </Text>
              </Pressable>

              <View style={styles.formRightBtns}>
                <Pressable
                  onPress={() => setIsCreating(false)}
                  style={styles.cancelBtn}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveEntry}
                  style={styles.saveSmallBtn}
                >
                  <Text style={styles.saveSmallBtnText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {isLoading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.stateText}>Loading journal...</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.stateBox}>
            <Ionicons
              name="book-outline"
              size={48}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.emptyTitle}>Your Travel Journal is empty</Text>
            <Text style={styles.stateText}>
              Tap Add Entry below to record your favorite travel moments and
              photos.
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.entryCard}>
                <View style={styles.entryTopRow}>
                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={theme.colors.primary}
                    />
                    <Text style={styles.dateText}>{item.createdAt}</Text>
                  </View>

                  <Pressable
                    onPress={() => handleDeleteEntry(item.id)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={theme.colors.textSecondary}
                    />
                  </Pressable>
                </View>

                <View style={styles.entryImageBox}>
                  <Image
                    source={{ uri: item.imageUri || DEFAULT_JOURNAL_IMAGE }}
                    resizeMode="cover"
                    style={styles.entryImage}
                  />
                </View>

                <Text style={styles.entryTitle}>{item.title}</Text>
                <Text style={styles.entryBody}>{item.content}</Text>
              </View>
            )}
          />
        )}

        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => setIsCreating((prev) => !prev)}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
          >
            <Ionicons
              name="pencil-outline"
              size={18}
              color={theme.colors.surface}
            />
            <Text style={styles.addBtnText}>
              {isCreating ? "Close Form" : "Add Entry"}
            </Text>
          </Pressable>
        </View>
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
      paddingTop: 48,
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
    headerSpacer: {
      width: 40,
    },
    formCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginHorizontal: theme.spacing.lg,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      gap: 10,
    },
    input: {
      height: 46,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.text,
    },
    textArea: {
      minHeight: 74,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14.5,
      color: theme.colors.text,
      textAlignVertical: "top",
    },
    formActionsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    photoPickerBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
    },
    photoPickerText: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.colors.primary,
    },
    formRightBtns: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    cancelBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cancelBtnText: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    saveSmallBtn: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.radius.pill,
    },
    saveSmallBtnText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: 100,
      gap: theme.spacing.lg,
    },
    entryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
    },
    entryTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    dateText: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.colors.text,
    },
    entryImageBox: {
      width: "100%",
      height: 195,
      borderRadius: theme.radius.md,
      overflow: "hidden",
      backgroundColor: theme.colors.surfaceAlt,
      marginBottom: 14,
    },
    entryImage: {
      width: "100%",
      height: "100%",
    },
    entryTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 6,
    },
    entryBody: {
      fontSize: 14.5,
      lineHeight: 21,
      color: theme.colors.textSecondary,
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
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
