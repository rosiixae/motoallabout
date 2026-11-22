import { useLocalSearchParams, useRouter } from 'expo-router';

import { TipBody } from '@/components/TipBody';
import { Button, ErrorBox, Loading, Screen } from '@/components/ui';
import { getTip } from '@/lib/data';
import { useFocusData } from '@/lib/hooks';

export default function TippDetail() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, loading } = useFocusData(() => getTip(slug), [slug]);
  const tr = data?.tip_translations.find((x) => x.locale_code === 'de') ?? data?.tip_translations[0];

  return (
    <Screen kicker="Tipps & Tricks" title={tr?.title ?? ''} onBack={() => router.back()}>
      {error ? <ErrorBox message={error} /> : null}
      {loading && !data ? <Loading /> : null}
      {tr ? <TipBody markdown={tr.body_md} /> : null}
      {slug === 'warnsymbole' ? <Button label="Alle Warnleuchten ansehen" onPress={() => router.push('/warnleuchten')} /> : null}
      {slug === 'kettenpflege' ? (
        <Button
          label="Kettenpflege als erledigt eintragen"
          variant="secondary"
          onPress={() => router.push({ pathname: '/anleitung/[key]', params: { key: 'kette', task: 'chain_care' } })}
        />
      ) : null}
    </Screen>
  );
}
