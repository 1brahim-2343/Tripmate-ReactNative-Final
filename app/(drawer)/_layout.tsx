import { Drawer } from "expo-router/drawer";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "../../src/contexts/ThemeContext";
import { Pressable } from "react-native";

export default function DrawerLayout() {
  const { theme } = useTheme();

  return (
    <Drawer
      screenOptions={({ navigation }) => ({
        drawerPosition: "left",
        headerShown: true,
        headerTransparent: true,
        headerTitle: "",
        headerShadowVisible: false,
        drawerType: "front",
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.textSecondary,
        drawerStyle: { backgroundColor: theme.colors.surface },
        headerLeft: () => (
          <Pressable
            onPress={() => navigation.toggleDrawer()}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.colors.surface,
            }}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
          </Pressable>
        ),
      })}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: "Explore & Trips",
          drawerIcon: ({ color, size }) => (
            <Ionicons
              name="compass-outline"
              size={size}
              color={theme.colors.text}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="journal"
        options={{
          title: "Travel Journal",
          headerShown: true,
          drawerIcon: ({ size }) => (
            <Ionicons
              name="book-outline"
              size={size}
              color={theme.colors.text}
            />
          ),
        }}
      />
    </Drawer>
  );
}
