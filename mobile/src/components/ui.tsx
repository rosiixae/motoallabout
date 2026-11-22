import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts, useTheme } from '@/theme/theme';
import { Icon, type IconName } from './Icon';

// ---------------------------------------------------------------------
// Bildschirm mit Titel und Scroll-Bereich
// ---------------------------------------------------------------------
type ScreenProps = {
  title?: string;
  kicker?: string;
  onBack?: () => void;
  right?: ReactNode;
  children: ReactNode;
  scroll?: boolean;
};

export function Screen({ title, kicker, onBack, right, children, scroll = true }: ScreenProps) {
  const content = (
    <>
      {(title || onBack || right) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {onBack && (
              <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Zurück" hitSlop={8} style={styles.back}>
                <Icon name="zurueck" size={22} />
              </Pressable>
            )}
            <View style={{ flexShrink: 1 }}>
              {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
              {title ? (
                <Text style={[styles.title, onBack ? styles.titleSmall : null]} accessibilityRole="header">
                  {title}
                </Text>
              ) : null}
            </View>
          </View>
          {right}
        </View>
      )}
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.scroll, { flex: 1 }]}>{content}</View>
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------
// Karte
// ---------------------------------------------------------------------
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[styles.h2, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, style, muted }: { children: ReactNode; style?: StyleProp<TextStyle>; muted?: boolean }) {
  return <Text style={[styles.body, muted ? styles.muted : null, style]}>{children}</Text>;
}

export function Small({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.small, style]}>{children}</Text>;
}

// ---------------------------------------------------------------------
// Knöpfe
// ---------------------------------------------------------------------
type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', icon, loading, disabled, style }: ButtonProps) {
  const { accent } = useTheme();
  const isPrimary = variant === 'primary';
  const fg =
    variant === 'primary' ? colors.white : variant === 'danger' ? colors.danger : variant === 'ghost' ? accent.accent : accent.accent;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!(disabled || loading) }}
      style={({ pressed }) => [
        styles.button,
        isPrimary && { backgroundColor: accent.accent },
        variant === 'secondary' && { backgroundColor: colors.white, borderWidth: 1, borderColor: accent.accent },
        (variant === 'ghost' || variant === 'danger') && styles.buttonGhost,
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.8 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={fg} strokeWidth={2.4} /> : null}
          <Text style={[styles.buttonText, { color: fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------
// Eingabefeld mit Beschriftung
// ---------------------------------------------------------------------
type FieldProps = TextInputProps & { label: string; hint?: string; error?: string | null };

export function Field({ label, hint, error, style, ...rest }: FieldProps) {
  const { accent } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        selectionColor={accent.accent}
        style={[styles.input, error ? { borderColor: colors.danger } : null, style]}
        accessibilityLabel={label}
        {...rest}
      />
      {error ? <Text style={[styles.small, { color: colors.danger }]}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.small}>{hint}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------
// Fortschrittsbalken
// ---------------------------------------------------------------------
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const { accent } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={styles.track}>
      <View style={[styles.bar, { width: `${Math.round(pct * 100)}%`, backgroundColor: color ?? accent.accent }]} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Listenzeile (z. B. im Profil)
// ---------------------------------------------------------------------
type RowProps = { label: string; value?: string; onPress?: () => void; last?: boolean; right?: ReactNode };

export function ListRow({ label, value, onPress, last, right }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && onPress ? { backgroundColor: colors.background } : null]}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 }}>
        {value ? (
          <Text style={[styles.body, styles.muted]} numberOfLines={1}>
            {value}
          </Text>
        ) : null}
        {right}
        {onPress ? <Icon name="weiter" size={20} color={colors.muted} /> : null}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------
// Runder Icon-Hintergrund
// ---------------------------------------------------------------------
export function IconBadge({ name, size = 36, tone = 'accent' }: { name: IconName; size?: number; tone?: 'accent' | 'warning' | 'danger' }) {
  const { accent } = useTheme();
  const bg = tone === 'accent' ? accent.accentSoft : tone === 'warning' ? colors.warningSoft : '#FEE4E2';
  const fg = tone === 'accent' ? accent.accent : tone === 'warning' ? colors.warning : colors.danger;
  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: bg }]}>
      <Icon name={name} size={size * 0.56} color={fg} />
    </View>
  );
}

// ---------------------------------------------------------------------
// Auswahl-Chips
// ---------------------------------------------------------------------
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const { accent } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: accent.accentSoft, borderColor: accent.accent, borderWidth: 2 }
          : { backgroundColor: colors.white, borderColor: colors.inputBorder, borderWidth: 1 },
      ]}
    >
      <Text style={[styles.chipText, { color: selected ? accent.accentDark : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Loading() {
  const { accent } = useTheme();
  return (
    <View style={{ padding: 40, alignItems: 'center' }}>
      <ActivityIndicator color={accent.accent} />
    </View>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <View style={styles.errorBox} accessibilityRole="alert">
      <Icon name="warnung" size={18} color={colors.danger} />
      <Text style={[styles.small, { color: colors.danger, flex: 1 }]}>{message}</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingTop: 16, gap: 18, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 1 },
  back: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  kicker: { fontSize: 14, color: colors.muted, fontFamily: fonts.body },
  title: { fontSize: 34, fontWeight: '700', color: colors.text, fontFamily: fonts.heading, letterSpacing: -0.5 },
  titleSmall: { fontSize: 28 },
  card: { backgroundColor: colors.card, borderRadius: 18, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 14 },
  h2: { fontSize: 21, fontWeight: '700', color: colors.text, fontFamily: fonts.heading },
  body: { fontSize: 15, lineHeight: 21, color: colors.text, fontFamily: fonts.body },
  muted: { color: colors.muted },
  small: { fontSize: 12.5, lineHeight: 17, color: colors.muted, fontFamily: fonts.body },
  button: {
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonGhost: { minHeight: 44, backgroundColor: 'transparent', paddingHorizontal: 4, alignSelf: 'flex-start' },
  buttonText: { fontSize: 16, fontWeight: '600', fontFamily: fonts.body },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.white,
    fontSize: 16,
    color: colors.text,
  },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.track, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  row: { minHeight: 60, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  badge: { alignItems: 'center', justifyContent: 'center' },
  chip: { minHeight: 44, borderRadius: 22, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEE4E2',
  },
});
