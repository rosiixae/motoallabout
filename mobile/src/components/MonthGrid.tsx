import { Pressable, StyleSheet, Text, View } from 'react-native';

import { toIsoDate, weekdayShort } from '@/lib/format';
import { colors, useTheme } from '@/theme/theme';

type Props = {
  year: number;
  month: number; // 0–11
  marked: Set<string>; // ISO-Daten mit Termin/Fälligkeit
  selected?: string | null;
  onSelect?: (iso: string) => void;
  compact?: boolean;
};

export function MonthGrid({ year, month, marked, selected, onSelect, compact }: Props) {
  const { accent } = useTheme();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7; // Montag = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayIso = toIsoDate(new Date());

  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const size = compact ? 30 : 40;

  return (
    <View style={{ gap: 4 }}>
      <View style={styles.row}>
        {weekdayShort.map((w) => (
          <Text key={w} style={styles.weekday}>
            {w}
          </Text>
        ))}
      </View>
      {Array.from({ length: cells.length / 7 }, (_, r) => (
        <View key={r} style={styles.row}>
          {cells.slice(r * 7, r * 7 + 7).map((d, i) => {
            if (d == null) return <View key={i} style={[styles.cell, { height: size }]} />;
            const iso = toIsoDate(new Date(year, month, d));
            const isMarked = marked.has(iso);
            const isSelected = selected === iso;
            const isToday = iso === todayIso;
            return (
              <Pressable
                key={i}
                disabled={!onSelect}
                onPress={() => onSelect?.(iso)}
                accessibilityRole={onSelect ? 'button' : undefined}
                accessibilityLabel={`${d}.${isMarked ? ' Termin' : ''}`}
                style={[styles.cell, { height: size }]}
              >
                <View
                  style={[
                    styles.day,
                    { width: size, height: size, borderRadius: size / 2 },
                    isMarked && { backgroundColor: accent.accent },
                    isSelected && !isMarked && { backgroundColor: accent.accentSoft },
                    isSelected && isMarked && { borderWidth: 2, borderColor: accent.accentDark },
                    isToday && !isMarked && !isSelected && { borderWidth: 1, borderColor: accent.accent },
                  ]}
                >
                  <Text style={[styles.dayText, isMarked && { color: colors.white, fontWeight: '700' }]}>{d}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: colors.muted, paddingBottom: 4 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  day: { alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 13, color: colors.text },
});
