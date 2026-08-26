import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { formatJod } from "@/domain/money";
import type { RequestStatus } from "@/domain/types";
import { useRequests } from "@/hooks/use-requests";
import { isRTL } from "@/i18n/locale";
import { strings } from "@/i18n/strings";
import { Avatar } from "@/ui/avatar";
import { Card } from "@/ui/card";
import { RequestsIcon } from "@/ui/icons";
import { MoneyText } from "@/ui/money-text";
import { ErrorView, LoadingView } from "@/ui/query-state";
import { StatusBadge } from "@/ui/status-badge";
import { colors, fonts, radii } from "@/ui/theme";

type Filter = "all" | RequestStatus;

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const styles = useMemo(() => createStyles(), []);

  const all = useRequests();
  const pending = useRequests("pending");
  const approved = useRequests("approved");
  const rejected = useRequests("rejected");

  const active =
    filter === "all"
      ? all
      : filter === "pending"
        ? pending
        : filter === "approved"
          ? approved
          : rejected;

  const filters: { key: Filter; label: string; count: number }[] = [
    {
      key: "all",
      label: strings.requestsScreen.filterAll,
      count: all.data?.length ?? 0,
    },
    {
      key: "pending",
      label: strings.requestsScreen.filterPending,
      count: pending.data?.length ?? 0,
    },
    {
      key: "approved",
      label: strings.requestsScreen.filterApproved,
      count: approved.data?.length ?? 0,
    },
    {
      key: "rejected",
      label: strings.requestsScreen.filterRejected,
      count: rejected.data?.length ?? 0,
    },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>{strings.requestsScreen.title}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsRow}
      >
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipOn]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.chipLabel, filter === f.key && styles.chipLabelOn]}
            >
              {f.label}
            </Text>
            <View
              style={[
                styles.chipCount,
                filter === f.key ? styles.chipCountOn : styles.chipCountOff,
              ]}
            >
              <Text
                style={[
                  styles.chipCountText,
                  filter === f.key
                    ? styles.chipCountTextOn
                    : styles.chipCountTextOff,
                ]}
              >
                {f.count}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.listContent}>
        {active.isLoading ? (
          <LoadingView />
        ) : active.isError ? (
          <ErrorView />
        ) : active.data && active.data.length > 0 ? (
          <View style={{ gap: 10 }}>
            {active.data.map((r) => (
              <TouchableOpacity
                key={r.id}
                style={styles.row}
                onPress={() => router.push(`/request/${r.id}`)}
              >
                <Avatar
                  name={r.requester?.display_name ?? ""}
                  id={r.requester_id}
                />
                <View style={styles.textBlock}>
                  <Text style={styles.name}>{r.requester?.display_name}</Text>
                  <Text style={styles.type} numberOfLines={1}>
                    {strings.requestTypes[r.type].label}
                  </Text>
                </View>
                <View style={styles.trailing}>
                  <MoneyText style={styles.amount}>
                    {formatJod(r.amount_fils)} JOD
                  </MoneyText>
                  <StatusBadge status={r.status} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <RequestsIcon size={26} color={colors.muted} strokeWidth={1.8} />
            </View>
            <Text style={styles.emptyTitle}>
              {strings.requestsScreen.emptyTitle}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === "pending"
                ? strings.requestsScreen.emptyPendingSubtitle
                : strings.requestsScreen.emptyOtherSubtitle}
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

// isRTL() must be read inside this factory (called at render time), not at
// module scope — StyleSheet.create only runs once, on first import, which
// happens before the app finishes loading the saved language preference.
function createStyles() {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    header: {
      paddingHorizontal: 20,
    },
    title: {
      fontFamily: fonts.extraBold,
      fontSize: 24,
      color: colors.ink,
      marginBottom: 20,
      textAlign: isRTL() ? "right" : "left",
    },
    chipsScroll: {
      flexGrow: 0,
    },
    chipsRow: {
      paddingHorizontal: 20,
      gap: 8,
      paddingBottom: 16,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      minHeight: 40,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: radii.pill,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipOn: {
      backgroundColor: colors.gold,
      borderColor: colors.gold,
    },
    chipLabel: {
      fontFamily: fonts.semiBold,
      fontSize: 13,
      lineHeight: 22,
      color: colors.muted,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    chipLabelOn: {
      color: "#000",
    },
    chipCount: {
      borderRadius: radii.pill,
      paddingHorizontal: 6,
      paddingVertical: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    chipCountOff: {
      backgroundColor: colors.surface2,
    },
    chipCountOn: {
      backgroundColor: "rgba(0,0,0,0.15)",
    },
    chipCountText: {
      fontSize: 11,
      lineHeight: 14,
      fontFamily: fonts.semiBold,
      includeFontPadding: false,
      textAlignVertical: "center",
    },
    chipCountTextOff: {
      color: colors.muted,
    },
    chipCountTextOn: {
      color: "#000",
    },
    listContent: {
      paddingHorizontal: 20,
      paddingTop: 4,
      paddingBottom: 24,
    },
    row: {
      flexDirection: isRTL() ? "row-reverse" : "row",
      alignItems: "center",
      gap: 14,
      padding: 16,
      borderRadius: radii.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textBlock: {
      flex: 1,
      minWidth: 0,
      alignItems: "flex-end",
    },
    name: {
      fontFamily: fonts.bold,
      fontSize: 14,
      color: colors.ink,
      marginBottom: 4,
    },
    type: {
      fontFamily: fonts.regular,
      fontSize: 12,
      color: colors.muted,
    },
    trailing: {
      alignItems: "flex-end",
      gap: 6,
    },
    amount: {
      fontSize: 15,
      color: colors.ink,
      lineHeight: 19,
    },
    emptyCard: {
      padding: 52,
      alignItems: "center",
    },
    emptyIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surface2,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    emptyTitle: {
      fontFamily: fonts.semiBold,
      fontSize: 15,
      color: colors.ink,
      marginBottom: 6,
    },
    emptySubtitle: {
      fontFamily: fonts.regular,
      fontSize: 13,
      color: colors.muted,
      textAlign: "center",
    },
  });
}
