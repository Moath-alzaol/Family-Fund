import { Redirect, Stack } from 'expo-router';

import { useSession } from '@/hooks/use-session';

export default function AuthLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
