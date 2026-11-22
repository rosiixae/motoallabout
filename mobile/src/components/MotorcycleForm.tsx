import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { getManufacturers, getModels, getVariants, type MotorcycleInput } from '@/lib/data';
import { formatDate, formatNumber, parseKm, parseSwissDate } from '@/lib/format';
import { friendlyError } from '@/lib/hooks';
import type { Manufacturer, Model, ModelVariant, Motorcycle } from '@/lib/types';
import { colors, useTheme } from '@/theme/theme';
import { Body, Button, Card, Chip, ErrorBox, Field, H2, Loading, Small } from './ui';

export const categories: { code: string; label: string }[] = [
  { code: 'naked', label: 'Naked' },
  { code: 'supersport', label: 'Supersport' },
  { code: 'sport_tourer', label: 'Sporttourer' },
  { code: 'tourer', label: 'Tourer' },
  { code: 'adventure', label: 'Adventure' },
  { code: 'enduro', label: 'Enduro' },
  { code: 'supermoto', label: 'Supermoto' },
  { code: 'cruiser', label: 'Cruiser' },
  { code: 'cafe_racer', label: 'Café Racer / Retro' },
  { code: 'scrambler', label: 'Scrambler' },
  { code: 'scooter', label: 'Roller' },
];

export const drives: { code: string; label: string }[] = [
  { code: 'chain', label: 'Kette' },
  { code: 'shaft', label: 'Kardan' },
  { code: 'belt', label: 'Zahnriemen' },
  { code: 'cvt', label: 'Variomatik' },
];

export type MotorcycleFormResult = { input: MotorcycleInput; currentKm: number | null };

type Props = {
  initial?: Motorcycle | null;
  initialKm?: number | null;
  saving: boolean;
  submitLabel: string;
  onSubmit: (result: MotorcycleFormResult) => void;
};

function variantLabel(v: ModelVariant): string {
  const years = v.year_from ? `${v.year_from}–${v.year_to ?? 'heute'}` : 'alle Jahrgänge';
  return v.label ? `${v.label} (${years})` : years;
}

export function MotorcycleForm({ initial, initialKm, saving, submitLabel, onSubmit }: Props) {
  const { accent } = useTheme();
  const initialModel = initial?.model_variants?.models ?? null;

  const [manufacturers, setManufacturers] = useState<Manufacturer[] | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [variants, setVariants] = useState<ModelVariant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [brandQuery, setBrandQuery] = useState('');
  const [brand, setBrand] = useState<Manufacturer | null>(initialModel?.manufacturers ?? null);
  const [customBrand, setCustomBrand] = useState(initial?.custom_manufacturer ?? '');
  const [model, setModel] = useState<Model | null>(initialModel);
  const [customModel, setCustomModel] = useState(initial?.custom_model ?? '');
  const [variant, setVariant] = useState<ModelVariant | null>(initial?.model_variants ?? null);
  const [manual, setManual] = useState(!!initial && !initial.model_variant_id);

  const [category, setCategory] = useState<string | null>(initial?.category_code ?? initialModel?.category_code ?? null);
  const [drive, setDrive] = useState<string | null>(initial?.drive_type_code ?? initialModel?.drive_type_code ?? null);
  const [year, setYear] = useState(initial?.model_year ? String(initial.model_year) : '');
  const [km, setKm] = useState(initialKm != null ? formatNumber(initialKm) : '');
  const [nickname, setNickname] = useState(initial?.nickname ?? '');
  const [purchased, setPurchased] = useState(initial?.purchased_on ? formatDate(initial.purchased_on) : '');
  const [firstReg, setFirstReg] = useState(initial?.first_registration_on ? formatDate(initial.first_registration_on) : '');
  const [nextMfk, setNextMfk] = useState(initial?.next_inspection_on ? formatDate(initial.next_inspection_on) : '');

  useEffect(() => {
    getManufacturers()
      .then(setManufacturers)
      .catch((e) => setError(friendlyError(String(e))));
  }, []);

  useEffect(() => {
    if (!brand) return setModels([]);
    getModels(brand.id)
      .then(setModels)
      .catch((e) => setError(friendlyError(String(e))));
  }, [brand]);

  useEffect(() => {
    if (!model) return setVariants([]);
    getVariants(model.id)
      .then((list) => {
        setVariants(list);
        if (list.length === 1) setVariant(list[0]);
      })
      .catch((e) => setError(friendlyError(String(e))));
  }, [model]);

  const filteredBrands = useMemo(() => {
    const q = brandQuery.trim().toLowerCase();
    if (!manufacturers) return [];
    return q ? manufacturers.filter((m) => m.name.toLowerCase().includes(q)) : manufacturers;
  }, [manufacturers, brandQuery]);

  function pickModel(m: Model) {
    setModel(m);
    setVariant(null);
    setCategory(m.category_code);
    setDrive(m.drive_type_code);
  }

  function submit() {
    setError(null);
    const kmValue = km.trim() ? parseKm(km) : null;
    const yearValue = year.trim() ? Number(year.trim()) : null;
    if (yearValue != null && (!Number.isInteger(yearValue) || yearValue < 1900 || yearValue > new Date().getFullYear() + 1)) {
      return setError('Bitte einen gültigen Jahrgang eingeben, z. B. 2021.');
    }
    const dates: Record<string, string | null> = {};
    for (const [key, value, label] of [
      ['purchased', purchased, 'Gekauft am'],
      ['firstReg', firstReg, '1. Inverkehrsetzung'],
      ['nextMfk', nextMfk, 'Nächste MFK'],
    ] as const) {
      if (!value.trim()) dates[key] = null;
      else {
        const parsed = parseSwissDate(value);
        if (!parsed) return setError(`«${label}» bitte so eingeben: TT.MM.JJJJ`);
        dates[key] = parsed;
      }
    }

    if (manual) {
      if (!customBrand.trim() || !customModel.trim()) return setError('Bitte Marke und Modell eingeben.');
    } else if (!variant) {
      return setError(model ? 'Bitte wähle den Jahrgang.' : 'Bitte wähle Marke und Modell, oder trage sie von Hand ein.');
    }
    if (!initial && kmValue == null) return setError('Bitte den Kilometerstand eingeben.');

    const modelCategory = manual ? null : model?.category_code ?? null;
    const modelDrive = manual ? null : model?.drive_type_code ?? null;

    onSubmit({
      input: {
        model_variant_id: manual ? null : variant!.id,
        custom_manufacturer: manual ? customBrand.trim() : null,
        custom_model: manual ? customModel.trim() : null,
        // nur speichern, wenn es vom Katalog abweicht
        category_code: category && category !== modelCategory ? category : null,
        drive_type_code: drive && drive !== modelDrive ? drive : null,
        model_year: yearValue,
        nickname: nickname.trim() || null,
        purchased_on: dates.purchased,
        // Ab diesem Stand rechnet die App, wenn noch keine Wartung eingetragen ist
        odometer_at_purchase_km: initial ? initial.odometer_at_purchase_km : kmValue,
        first_registration_on: dates.firstReg,
        next_inspection_on: dates.nextMfk,
      },
      currentKm: kmValue,
    });
  }

  if (!manufacturers && !error) return <Loading />;

  return (
    <View style={{ gap: 18 }}>
      {/* Marke und Modell */}
      {!manual ? (
        <Card>
          <H2>Marke</H2>
          {brand ? (
            <Chip label={`${brand.name}  ✕`} selected onPress={() => {
                setBrand(null);
                setModel(null);
                setVariant(null);
              }} />
          ) : (
            <>
              <Field label="Marke suchen" value={brandQuery} onChangeText={setBrandQuery} placeholder="z. B. Yamaha" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {filteredBrands.map((m) => (
                  <Chip key={m.id} label={m.name} selected={false} onPress={() => setBrand(m)} />
                ))}
              </View>
            </>
          )}

          {brand ? (
            <>
              <H2 style={{ marginTop: 6 }}>Modell</H2>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {models.map((m) => (
                  <Chip key={m.id} label={m.name} selected={model?.id === m.id} onPress={() => pickModel(m)} />
                ))}
              </View>
            </>
          ) : null}

          {model && variants.length > 1 ? (
            <>
              <H2 style={{ marginTop: 6 }}>Generation</H2>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {variants.map((v) => (
                  <Chip key={v.id} label={variantLabel(v)} selected={variant?.id === v.id} onPress={() => setVariant(v)} />
                ))}
              </View>
            </>
          ) : null}

          <Pressable onPress={() => setManual(true)} accessibilityRole="button">
            <Text style={{ color: accent.accent, fontWeight: '600', fontSize: 14 }}>Mein Motorrad ist nicht in der Liste ›</Text>
          </Pressable>
        </Card>
      ) : (
        <Card>
          <H2>Marke und Modell</H2>
          <Field label="Marke" value={customBrand} onChangeText={setCustomBrand} placeholder="z. B. Moto Guzzi" />
          <Field label="Modell" value={customModel} onChangeText={setCustomModel} placeholder="z. B. V7 Stone" />
          <Small>
            Für Modelle ausserhalb der Liste nimmt die App allgemeine Richtwerte. Die genauen Werte stehen im Handbuch, du kannst sie
            später anpassen.
          </Small>
          <Pressable onPress={() => setManual(false)} accessibilityRole="button">
            <Text style={{ color: accent.accent, fontWeight: '600', fontSize: 14 }}>‹ Doch aus der Liste wählen</Text>
          </Pressable>
        </Card>
      )}

      {variant && !manual ? (
        <Card style={{ gap: 6 }}>
          <Body style={{ fontWeight: '700' }}>Werte aus der Liste</Body>
          <Small>
            {variant.oil_spec ? `Öl: ${variant.oil_spec}` : 'Ölsorte: im Handbuch nachschauen'}
            {variant.oil_capacity_with_filter_l ? ` · ca. ${String(variant.oil_capacity_with_filter_l).replace('.', ',')} L` : ''}
          </Small>
          <Small style={{ color: variant.data_status_code === 'verified' ? colors.success : colors.warning }}>
            {variant.data_status_code === 'verified'
              ? 'Herstellerwerte geprüft'
              : variant.data_status_code === 'to_check'
                ? 'Werte noch nicht ganz sicher: bitte im Handbuch prüfen'
                : 'Für dieses Modell fehlen noch Herstellerwerte: die App nimmt Richtwerte'}
          </Small>
        </Card>
      ) : null}

      {/* Kategorie und Antrieb */}
      <Card>
        <H2>Kategorie</H2>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {categories.map((c) => (
            <Chip key={c.code} label={c.label} selected={category === c.code} onPress={() => setCategory(c.code)} />
          ))}
        </View>
        <H2 style={{ marginTop: 6 }}>Antrieb</H2>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {drives.map((d) => (
            <Chip key={d.code} label={d.label} selected={drive === d.code} onPress={() => setDrive(d.code)} />
          ))}
        </View>
        {!manual && model ? <Small>Aus dem Modell erkannt. Du kannst es hier ändern.</Small> : null}
      </Card>

      {/* Weitere Angaben */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Jahrgang" value={year} onChangeText={setYear} keyboardType="number-pad" placeholder="JJJJ" maxLength={4} />
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label={initial ? 'Kilometer heute' : 'Kilometer'}
            value={km}
            onChangeText={setKm}
            keyboardType="number-pad"
            placeholder="km"
          />
        </View>
      </View>
      <Field label="Spitzname (freiwillig)" value={nickname} onChangeText={setNickname} />
      <Field
        label="Gekauft am (freiwillig)"
        value={purchased}
        onChangeText={setPurchased}
        placeholder="TT.MM.JJJJ"
        keyboardType="numbers-and-punctuation"
      />
      <Card>
        <H2>MFK</H2>
        <Field
          label="1. Inverkehrsetzung"
          value={firstReg}
          onChangeText={setFirstReg}
          placeholder="TT.MM.JJJJ"
          keyboardType="numbers-and-punctuation"
          hint="Steht im Fahrzeugausweis (Feld 36). Damit rechnet die App die nächste MFK aus."
        />
        <Field
          label="Nächste MFK (falls bekannt)"
          value={nextMfk}
          onChangeText={setNextMfk}
          placeholder="TT.MM.JJJJ"
          keyboardType="numbers-and-punctuation"
          hint="Zum Beispiel aus dem Aufgebot vom Strassenverkehrsamt."
        />
      </Card>

      {error ? <ErrorBox message={error} /> : null}
      <Button label={submitLabel} onPress={submit} loading={saving} />
    </View>
  );
}
