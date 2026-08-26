import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useRequests } from "@/hooks/use-requests";
import { isRTL } from "@/i18n/locale";
import {
  FundIcon,
  HomeIcon,
  PlusIcon,
  RequestsIcon,
  SettingsIcon,
} from "@/ui/icons";
import { colors, fonts } from "@/ui/theme";

const ICONS: Record<string, typeof HomeIcon> = {
  index: HomeIcon,
  requests: RequestsIcon,
  fund: FundIcon,
  settings: SettingsIcon,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pending = useRequests("pending");
  const pendingCount = pending.data?.length ?? 0;

  const renderTab = (route: (typeof state.routes)[number]) => {
    const isFocused = state.routes[state.index]?.key === route.key;
    const Icon = ICONS[route.name] ?? HomeIcon;
    const label = descriptors[route.key]?.options.title ?? route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <TouchableOpacity key={route.key} style={styles.tab} onPress={onPress}>
        <View>
          <Icon
            size={22}
            color={isFocused ? colors.gold : colors.muted}
            strokeWidth={isFocused ? 2.5 : 1.8}
          />
          {route.name === "requests" && pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? colors.gold : colors.muted,
              fontFamily: isFocused ? fonts.semiBold : fonts.regular,
            },
          ]}
        >
          {label}
        </Text>
        {isFocused && <View style={styles.activeDash} />}
      </TouchableOpacity>
    );
  };

  const orderedRoutes = isRTL() ? [...state.routes].reverse() : state.routes;
  const left = orderedRoutes.slice(0, 2);
  const right = orderedRoutes.slice(2, 4);

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      {left.map(renderTab)}
      <View style={styles.fabWrap}>
        <TouchableOpacity
          onPress={() => router.push("/request/new")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gold, "#7A5810"]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.fab}
          >
            <PlusIcon size={24} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
      {right.map(renderTab)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 12,
  },
  label: {
    fontSize: 10,
    marginTop: 4,
  },
  badge: {
    position: "absolute",
    top: -5,
    left: -6,
    backgroundColor: colors.danger,
    borderRadius: 100,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    lineHeight: 14,
    includeFontPadding: false,
    textAlignVertical: "center",
    fontFamily: fonts.bold,
  },
  activeDash: {
    position: "absolute",
    bottom: 0,
    width: 20,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 100,
  },
  fabWrap: {
    paddingBottom: 8,
    flexShrink: 0,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    shadowColor: colors.gold,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
