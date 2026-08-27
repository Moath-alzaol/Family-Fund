import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { z } from 'zod';

import { supabase } from '@/api/supabase';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { AlertBanner } from '@/ui/alert-banner';
import { Button } from '@/ui/button';
import { KeyboardAvoidingScreen } from '@/ui/keyboard-screen';
import { notify } from '@/ui/notify';
import { ScreenHeader } from '@/ui/screen-header';
import { colors, fonts, radii } from '@/ui/theme';

const schema = z
  .object({
    password: z.string().min(6),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: strings.changePassword.mismatch,
  });

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordScreen() {
  const router = useRouter();
  const styles = useMemo(() => createStyles(), []);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      setServerError(strings.errors.unknown);
      return;
    }
    notify(strings.changePassword.success);
    router.back();
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader title={strings.changePassword.title} />
      <KeyboardAvoidingScreen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>{strings.changePassword.lead}</Text>

        <Text style={styles.label}>{strings.changePassword.newPasswordLabel}</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholderTextColor={colors.muted}
            />
          )}
        />
        {errors.password && <Text style={styles.fieldError}>{strings.changePassword.tooShort}</Text>}

        <Text style={styles.label}>{strings.changePassword.confirmPasswordLabel}</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
              placeholderTextColor={colors.muted}
            />
          )}
        />
        {errors.confirmPassword && <Text style={styles.fieldError}>{strings.changePassword.mismatch}</Text>}

        {serverError && <AlertBanner tone="bad" text={serverError} />}

        <Button label={strings.changePassword.submit} loading={isSubmitting} onPress={handleSubmit(onSubmit)} style={styles.submit} />
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
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
    textAlign: isRTL() ? 'right' : 'left',
    writingDirection: isRTL() ? 'rtl' : 'ltr',
  },
  submit: {
    marginTop: 20,
  },
  });
}
