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
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { queryClient } from '@/api/query-client';
import { SessionProvider } from '@/hooks/use-session';
import { initLocale } from '@/i18n/locale';
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
  const [localeLoaded, setLocaleLoaded] = useState(false);

  useEffect(() => {
    initLocale().then(() => setLocaleLoaded(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && localeLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, localeLoaded]);

  if (!fontsLoaded || !localeLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
