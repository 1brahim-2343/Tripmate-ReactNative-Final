import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { useAuth } from "../../src/contexts/AuthContext";
import { useTheme } from "../../src/contexts/ThemeContext";
import { AppTheme } from "../../src/theme/theme";
import { TextInput } from "react-native-paper";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);

  const handleValidation = async () => {
    setError("");

    if (!email.trim().includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    handleLogin();
  };
  const handleLogin = async () => {
    try {
      await login(email, password);
      handleRouting();
    } catch (error: any) {
      setError(error.message ?? "Invalid email or password.");
    }
  };
  const handleRouting = () => {
    router.replace("/(drawer)/(tabs)");
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Toppest part, Logo */}
        <View
          style={[styles.headerBanner, { paddingTop: 2 * theme.spacing.lg }]}
        >
          <Svg
            width="342"
            height="140"
            viewBox="0 0 342 140"
            style={styles.routeSvg}
          >
            <Path
              d="M20 120C80 120 90 50 150 60S250 110 320 30"
              stroke={theme.colors.surface}
              strokeOpacity={0.45}
              strokeWidth={3}
              strokeDasharray="2, 9"
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx="320" cy="30" r="9" fill={theme.colors.surface} />
          </Svg>

          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Svg width="22" height="22" viewBox="0 0 24 24">
                <Path
                  d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx="12"
                  cy="10"
                  r="2.5"
                  fill="none"
                  stroke={theme.colors.primary}
                  strokeWidth={2}
                />
              </Svg>
            </View>
            <Text style={styles.brandTitle}>TripMate</Text>
          </View>
        </View>

        {/* Form, all inputs etc. */}
        <View style={styles.formSection}>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to continue planning your trips.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry={!passwordVisible}
              style={styles.input}
              right={
                <TextInput.Icon
                  icon={passwordVisible ? "eye-off" : "eye"}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                />
              }
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Pressable
            onPress={handleValidation}
            style={({ pressed }) => [
              styles.signInButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.signInButtonText}>Sign in</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo button */}
          <Pressable
            onPress={() => {
              handleRouting();
            }}
            style={({ pressed }) => [
              styles.demoShadow,
              pressed && styles.pressed,
            ]}
          >
            <LinearGradient
              colors={["#1D4ED8", "#4338CA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.demoButton}
            >
              <View style={styles.demoIconBox}>
                <Ionicons name="rocket-outline" size={22} color="#FFFFFF" />
              </View>
              <View style={styles.demoTextBox}>
                <Text style={styles.demoTitle}>Try the demo</Text>
                <Text style={styles.demoSubtitle}>
                  Fills in sample credentials
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
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
    headerBanner: {
      height: 200,
      backgroundColor: theme.colors.primary,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: "flex-start",
      overflow: "hidden",
    },
    routeSvg: {
      position: "absolute",
      right: 0,
      top: 2 * theme.spacing.lg,
    },
    brandRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginTop: theme.spacing.lg,
    },
    logoBox: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    brandTitle: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    formSection: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    welcomeTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.colors.text,
      marginBottom: 6,
    },
    welcomeSubtitle: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    fieldGroup: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    input: {
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: theme.spacing.md,
      fontSize: 15,
      color: theme.colors.text,
    },
    errorText: {
      fontSize: 13,
      fontWeight: "500",
      color: theme.colors.danger,
      marginBottom: theme.spacing.md,
    },
    signInButton: {
      height: 52,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    signInButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.surface,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 22,
      gap: theme.spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    demoShadow: {
      borderRadius: 18,
      shadowColor: "#2563EB",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 20,
      elevation: 8,
    },
    demoButton: {
      height: 64,
      borderRadius: 18,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingHorizontal: 16,
    },
    demoIconBox: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.35)",
      alignItems: "center",
      justifyContent: "center",
    },
    demoTextBox: {
      flex: 1,
      gap: 2,
    },
    demoTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    demoSubtitle: {
      fontSize: 12.5,
      fontWeight: "500",
      color: "#E0E7FF",
    },
    pressed: {
      opacity: 0.85,
    },
  });
