import { Text, View } from 'react-native';

import { colors, useTheme } from '@/theme/theme';
import { Body } from './ui';

// Einfache Darstellung für die Tipps-Texte:
// Absätze, nummerierte Schritte ("1. …") und ein Hinweis-Kasten ("> **Titel:** Text").
export function TipBody({ markdown }: { markdown: string }) {
  const { accent } = useTheme();
  const blocks = markdown.split(/\n{2,}/);

  return (
    <View style={{ gap: 14 }}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\d+\.\s/.test(l))) {
          return (
            <View key={bi} style={{ gap: 12 }}>
              {lines.map((l, li) => {
                const [, n, text] = l.match(/^(\d+)\.\s(.*)$/) ?? [];
                return (
                  <View key={li} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
                    <View
                      style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: accent.accent, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text style={{ color: colors.white, fontWeight: '700' }}>{n}</Text>
                    </View>
                    <Body style={{ flex: 1 }}>{text}</Body>
                  </View>
                );
              })}
            </View>
          );
        }
        if (block.startsWith('> ')) {
          const text = block.slice(2);
          const m = text.match(/^\*\*(.+?):\*\*\s*(.*)$/s);
          return (
            <View key={bi} style={{ padding: 16, borderRadius: 14, backgroundColor: accent.accentSoft, gap: 4 }}>
              {m ? <Text style={{ fontWeight: '700', color: accent.accentDark, fontSize: 15 }}>{m[1]}</Text> : null}
              <Body>{m ? m[2] : text}</Body>
            </View>
          );
        }
        return (
          <Body key={bi} style={{ fontSize: 16, lineHeight: 23 }}>
            {block}
          </Body>
        );
      })}
    </View>
  );
}
