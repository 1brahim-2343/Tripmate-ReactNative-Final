import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AppTheme } from "../../src/theme/theme";
import { storage } from "../../src/services/storage";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

interface OnboardingSlide {
  id: string;
  icon: IconName;
  badge: string;
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    icon: "compass-outline",
    badge: "EXPLORE",
    title: "Discover Your Next Adventure",
    description:
      "Browse handpicked beaches, vibrant cities, and nature escapes with ratings, highlights, and interactive maps.",
  },
  {
    id: "2",
    icon: "calendar-outline",
    badge: "ORGANIZE",
    title: "Plan Day-by-Day Itineraries",
    description:
      "Build structured daily timelines for flights, hotels, landmarks, and dining—even when you are completely offline.",
  },
  {
    id: "3",
    icon: "wallet-outline",
    badge: "TRACK & REMEMBER",
    title: "Manage Budgets & Travel Journal",
    description:
      "Keep your trip expenses under control by category and capture unforgettable travel memories with photos and notes.",
  },
];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();
  const { width } = useWindowDimensions();

  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const completeOnboarding = async () => {
    await storage.setOnboardingDone();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Toppest part, skip button & logo */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <Ionicons name="paper-plane" size={20} color={theme.colors.primary} />
          <Text style={styles.brandText}>TripMate</Text>
        </View>

        {!isLastSlide && (
          <Pressable
            onPress={completeOnboarding}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/*Slides themselves*/}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={styles.iconOuterCircle}>
              <View style={styles.iconInnerCircle}>
                <Ionicons
                  name={item.icon}
                  size={64}
                  color={theme.colors.primary}
                />
              </View>
            </View>

            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      {/*Dots & button*/}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {SLIDES.map((slide, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>

        <Pressable
          onPress={completeOnboarding}
          style={({ pressed }) => [
            isLastSlide && styles.primaryButton,
            pressed && styles.pressed,
            !isLastSlide && styles.invisible,
          ]}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
          <Ionicons
            name={isLastSlide ? "checkmark-circle-outline" : "arrow-forward"}
            size={20}
            color={theme.colors.surface}
          />
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
    invisible: {
      opacity: 0,
      height: 54,
    },
    topBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: theme.spacing.sm,
    },
    brandText: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
    },
    skipButton: {
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
    },
    skipText: {
      fontSize: 15,
      fontWeight: "600",
      color: theme.colors.textSecondary,
    },
    slide: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: theme.spacing.xl,
    },
    iconOuterCircle: {
      width: 180,
      height: 180,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.primarySoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: theme.spacing.xl,
    },
    iconInnerCircle: {
      width: 132,
      height: 132,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    badgePill: {
      backgroundColor: theme.colors.primarySoft,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.pill,
      marginBottom: theme.spacing.md,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      color: theme.colors.primary,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: theme.spacing.md,
      lineHeight: 34,
    },
    description: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 23,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
      paddingTop: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    dotsContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
    },
    dot: {
      height: 8,
      borderRadius: theme.radius.pill,
    },
    dotActive: {
      width: 28,
      backgroundColor: theme.colors.primary,
    },
    dotInactive: {
      width: 8,
      backgroundColor: theme.colors.border,
    },
    primaryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: theme.spacing.sm,
      height: 54,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.primary,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    pressed: {
      opacity: 0.85,
    },
  });
