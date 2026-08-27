import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { localizeError } from '@/domain/errors';
import { jodToFils } from '@/domain/money';
import { useAddMember } from '@/hooks/use-admin-actions';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { AlertBanner } from '@/ui/alert-banner';
import { Button } from '@/ui/button';
import { Card } from '@/ui/card';
import { KeyValueRow } from '@/ui/key-value';
import { KeyboardAvoidingScreen } from '@/ui/keyboard-screen';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts, radii } from '@/ui/theme';

export default function AddMemberScreen() {
  const router = useRouter();
  const addMember = useAddMember();
  const [name, setName] = useState('');
  const [commitment, setCommitment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ username: string; temporaryPassword: string } | null>(null);
  const styles = useMemo(() => createStyles(), []);

  const onSubmit = async () => {
    setError(null);
    try {
      const result = await addMember.mutateAsync({
        displayName: name.trim(),
        commitmentFils: jodToFils(Number(commitment) || 0),
      });
      setCreated({ username: result.username, temporaryPassword: result.temporary_password });
    } catch (e) {
      setError(localizeError(e));
    }
  };

  if (created) {
    return (
      <View style={styles.screen}>
        <ScreenHeader title={strings.addMember.title} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{strings.addMember.successTitle}</Text>
          <Text style={styles.lead}>{strings.addMember.credentialsNote}</Text>
          <Card style={styles.card}>
            <KeyValueRow label={strings.addMember.usernameLabel}>{created.username}</KeyValueRow>
            <KeyValueRow label={strings.addMember.passwordLabel}>{created.temporaryPassword}</KeyValueRow>
          </Card>
          <Button label={strings.addMember.done} onPress={() => router.back()} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.addMember.title} />
      <KeyboardAvoidingScreen>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.lead}>{strings.addMember.lead}</Text>

          <Text style={styles.label}>{strings.addMember.nameLabel}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={strings.addMember.namePlaceholder}
            placeholderTextColor={colors.muted}
            selectTextOnFocus
          />

          <Text style={styles.label}>{strings.addMember.commitmentLabel}</Text>
          <TextInput
            style={styles.input}
            value={commitment}
            onChangeText={setCommitment}
            placeholder={strings.addMember.commitmentPlaceholder}
            placeholderTextColor={colors.muted}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />

          {error && (
            <View style={styles.section}>
              <AlertBanner tone="bad" text={error} />
            </View>
          )}

          <View style={styles.section}>
            <Button
              label={strings.addMember.submit}
              disabled={!name.trim() || !Number(commitment)}
              loading={addMember.isPending}
              onPress={onSubmit}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingScreen>
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
    direction: 'ltr',
    backgroundColor: colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.ink,
    marginBottom: 4,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  lead: {
    fontFamily: fonts.regular,
    fontSize: 12.5,
    color: colors.muted,
    marginBottom: 16,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 14,
    marginBottom: 6,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 12,
    fontFamily: fonts.regular,
    fontSize: 14,
    backgroundColor: colors.surface,
    color: colors.ink,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  section: {
    marginTop: 20,
  },
  card: {
    marginBottom: 20,
  },
  });
}
