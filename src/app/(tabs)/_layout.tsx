import { Redirect, Tabs } from 'expo-router';

import { useSession } from '@/hooks/use-session';
import { strings } from '@/i18n/strings';
import { TabBar } from '@/ui/tab-bar';

export default function TabsLayout() {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return null;
  }
  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: strings.tabs.home }} />
      <Tabs.Screen name="requests" options={{ title: strings.tabs.requests }} />
      <Tabs.Screen name="fund" options={{ title: strings.tabs.fund }} />
      <Tabs.Screen name="settings" options={{ title: strings.tabs.settings }} />
    </Tabs>
  );
}
