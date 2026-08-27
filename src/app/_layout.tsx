import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
} from '@expo-google-fonts/cairo';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/query-client';
import { SessionProvider } from '@/hooks/use-session';
import { initLocale, subscribeToLocale, type Locale } from '@/i18n/locale';
import { colors } from '@/ui/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });
  const [locale, setLocale] = useState<Locale | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToLocale(setLocale);
    initLocale().then(setLocale);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (fontsLoaded && locale) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, locale]);

  if (!fontsLoaded || !locale) {
    return null;
  }

  return (
    <SafeAreaProvider key={locale}>
      <View style={{ flex: 1, direction: 'ltr' }}>
        <StatusBar style="light" />
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
          </SessionProvider>
        </QueryClientProvider>
      </View>
    </SafeAreaProvider>
  );
}
