import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useTheme } from "../../../src/contexts/ThemeContext";

export default function TabsLayout() {
  const { theme, isDark } = useTheme();

  return (
    <NativeTabs
      tintColor={theme.colors.primary}
      backgroundColor={theme.colors.surface}
      iconColor={{
        default: theme.colors.textSecondary,
        selected: theme.colors.primary,
      }}
      labelStyle={{
        default: { color: theme.colors.textSecondary },
        selected: { color: theme.colors.primary },
      }}

    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "house", selected: "house.fill" }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Label>Map</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "map", selected: "map.fill" }}
          md="map"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="trips">
        <NativeTabs.Trigger.Label>Trips</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "suitcase", selected: "suitcase.fill" }}
          md="luggage"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="favorites">
        <NativeTabs.Trigger.Label>Favorites</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "heart", selected: "heart.fill" }}
          md="favorite"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "person", selected: "person.fill" }}
          md="person"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
