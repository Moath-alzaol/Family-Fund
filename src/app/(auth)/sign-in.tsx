import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { supabase } from '@/api/supabase';
import { usernameToAuthEmail } from '@/domain/auth';
import { isRTL } from '@/i18n/locale';
import { strings } from '@/i18n/strings';
import { KeyboardAvoidingScreen } from '@/ui/keyboard-screen';
import { colors, fonts, radii } from '@/ui/theme';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function SignInScreen() {
  const styles = useMemo(() => createStyles(), []);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToAuthEmail(values.username),
      password: values.password,
    });
    if (error) {
      setServerError(strings.signIn.genericError);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingScreen>
        <ScrollView contentContainerStyle={styles.centered} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={[colors.gold, '#6B4C0A']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.logo}>
            <Text style={styles.logoGlyph}>ص</Text>
          </LinearGradient>

          <Text style={styles.title}>{strings.signIn.title}</Text>
          <Text style={styles.subtitle}>{strings.signIn.subtitle}</Text>

          <Text style={styles.label}>{strings.signIn.username}</Text>
          <Controller
            control={control}
            name="username"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="username"
                placeholderTextColor={colors.muted}
              />
            )}
          />
          {errors.username && <Text style={styles.fieldError}>{errors.username.message}</Text>}

          <Text style={styles.label}>{strings.signIn.password}</Text>
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
                textContentType="password"
                placeholderTextColor={colors.muted}
              />
            )}
          />
          {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}

          {serverError && <Text style={styles.serverError}>{serverError}</Text>}

          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isSubmitting} style={isSubmitting && styles.buttonDisabled}>
            <LinearGradient colors={[colors.gold, '#7A5810']} start={{ x: 0.15, y: 0 }} end={{ x: 0.85, y: 1 }} style={styles.button}>
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonLabel}>{strings.signIn.submit}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingScreen>

      <Text style={styles.footer}>{strings.signIn.footer}</Text>
    </SafeAreaView>
  );
}

// isRTL() must be read inside this factory (called at render time), not at
// module scope — StyleSheet.create only runs once, on first import, which
// happens before the app finishes loading the saved language preference.
function createStyles() {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 84,
    height: 84,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 22,
    shadowColor: colors.gold,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  logoGlyph: {
    fontFamily: fonts.extraBold,
    fontSize: 40,
    color: '#fff',
  },
  title: {
    fontFamily: fonts.extraBold,
    fontSize: 30,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: 36,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    padding: 14,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 14,
    textAlign: isRTL() ? 'right' : 'left',
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  serverError: {
    color: colors.danger,
    fontSize: 13,
    marginTop: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    borderRadius: radii.lg,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonLabel: {
    fontFamily: fonts.bold,
    fontSize: 14.5,
    color: '#fff',
  },
  footer: {
    textAlign: 'center',
    color: colors.muted,
    fontFamily: fonts.regular,
    fontSize: 12,
    paddingBottom: 20,
  },
  });
}
