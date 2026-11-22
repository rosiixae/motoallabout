import { Redirect, Stack } from 'expo-router';

import { Loading } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors } from '@/theme/theme';

export default function AuthLayout() {
  const { session, loading } = useAuth();
  if (loading) return <Loading />;
  if (session) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}
