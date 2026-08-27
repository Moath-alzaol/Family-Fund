import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/i18n/strings';
import { colors, fonts } from '@/ui/theme';

export function LoadingView() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.text}>{strings.common.loading}</Text>
    </View>
  );
}

export function ErrorView({ message }: { message?: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{message ?? strings.common.errorGeneric}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    direction: 'ltr',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 40,
    backgroundColor: colors.bg,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.muted,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
  },
});
