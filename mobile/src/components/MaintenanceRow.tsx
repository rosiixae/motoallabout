import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TaskStatus } from '@/lib/maintenance';
import { colors, useTheme } from '@/theme/theme';
import { IconBadge, ProgressBar } from './ui';

export function MaintenanceRow({ status, onPress }: { status: TaskStatus; onPress: () => void }) {
  const { accent } = useTheme();
  const barColor =
    status.level === 'overdue' ? colors.danger : status.level === 'due' ? colors.warning : accent.accent;
  const labelColor = status.level === 'overdue' ? colors.danger : status.level === 'due' ? colors.warning : colors.muted;
  const tone = status.level === 'overdue' ? 'danger' : status.level === 'due' ? 'warning' : 'accent';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${status.name}, ${status.label}`}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.7 }]}
    >
      <View style={styles.top}>
        <View style={styles.left}>
          <IconBadge name={status.icon} tone={tone} />
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.name}>{status.name}</Text>
            {status.sub ? <Text style={styles.sub}>{status.sub}</Text> : null}
          </View>
        </View>
        <Text style={[styles.status, { color: labelColor, fontWeight: status.level === 'ok' ? '400' : '700' }]}>
          {status.label}
        </Text>
      </View>
      <ProgressBar value={status.level === 'unknown' ? 0 : status.progress} color={barColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  status: { fontSize: 13, textAlign: 'right', flexShrink: 0, maxWidth: 140 },
});
