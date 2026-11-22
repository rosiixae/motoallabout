import { Redirect, Tabs } from 'expo-router';

import { Icon, type IconName } from '@/components/Icon';
import { Loading } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, useTheme } from '@/theme/theme';

const tabs: { name: string; title: string; icon: IconName }[] = [
  { name: 'home', title: 'Home', icon: 'home' },
  { name: 'tipps', title: 'Tipps', icon: 'tipps' },
  { name: 'motorrad', title: 'Motorrad', icon: 'motorrad' },
  { name: 'kalender', title: 'Kalender', icon: 'kalender' },
  { name: 'profil', title: 'Profil', icon: 'profil' },
];

export default function TabsLayout() {
  const { session, loading } = useAuth();
  const { accent } = useTheme();

  if (loading) return <Loading />;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: accent.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.white, borderTopColor: colors.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => <Icon name={t.icon} size={24} color={color} strokeWidth={1.8} />,
          }}
        />
      ))}
    </Tabs>
  );
}
