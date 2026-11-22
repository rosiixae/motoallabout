// Anleitungen für Pflege und Selbst-Checks (Texte aus dem Prototyp).
import type { IconName } from '../components/Icon';
import type { GuideKey } from '../lib/maintenance';

export type Guide = {
  title: string;
  subtitle: string;
  icon: IconName;
  /** Richtwert / Einleitung */
  hint: string;
  material?: string[];
  stepsTitle: string;
  steps: string[];
  /** «Gut zu wissen», «Wichtig» oder «Wann in die Werkstatt?» */
  info?: { title: string; text: string };
  /** 'diy' = selber machen und als erledigt markieren; 'check' = prüfen, ggf. Werkstatt */
  kind: 'diy' | 'check';
  /** Welche Wartungsarten mit «Erledigt» eingetragen werden */
  tasks: string[];
};

export const guides: Record<GuideKey, Guide> = {
  kette: {
    title: 'Kette',
    subtitle: 'Reinigen und schmieren',
    icon: 'kette',
    hint: 'Richtwert: alle 500 bis 1000 km und nach jeder Regenfahrt. Den genauen Wert für dein Motorrad findest du im Handbuch.',
    stepsTitle: "So geht's",
    steps: [
      'Motor aus und den Leerlauf (N) einlegen, sonst lässt sich das Hinterrad nicht drehen.',
      'Motorrad auf den Montageständer stellen, damit sich das Hinterrad frei drehen lässt. Ohne Montageständer: Motorrad auf den Seitenständer stellen, eine Person zieht es zur Seite, sodass es nur noch auf Seitenständer und Vorderrad steht. Eine zweite Person kann dann das Hinterrad leicht drehen.',
      'Kette mit Kettenreiniger und einer Bürste sauber machen und trocknen lassen.',
      'Kettenspray auf die Innenseite der Kette sprühen und dabei das Rad langsam drehen.',
      'Einige Minuten einwirken lassen und überschüssiges Fett mit einem Lappen abwischen.',
      'Kettendurchhang prüfen. Den richtigen Wert findest du im Handbuch.',
    ],
    kind: 'diy',
    tasks: ['chain_care', 'chain_check'],
  },
  oelwechsel: {
    title: 'Ölwechsel',
    subtitle: 'Öl und Ölfilter wechseln',
    icon: 'oel',
    hint: 'Werte für dein Motorrad stehen oben. Prüfe sie im Handbuch deines Motorrads.',
    material: [
      'Neues Öl laut Handbuch',
      'Neuer Ölfilter',
      'Neuer Dichtring für die Ablassschraube',
      'Auffangwanne',
      'Ölfilterschlüssel',
      'Drehmomentschlüssel',
      'Trichter',
      'Lappen und Handschuhe',
    ],
    stepsTitle: "So geht's",
    steps: [
      'Motor ein paar Minuten warmlaufen lassen und abstellen. Warmes Öl fliesst besser ab. Vorsicht, Motor und Auspuff sind heiss.',
      'Motorrad gerade hinstellen, am besten auf einen Montageständer. Die Auffangwanne unter die Ablassschraube stellen.',
      'Den Öleinfülldeckel oben am Motor öffnen. Dann die Ablassschraube unten herausdrehen und das Öl ganz ablaufen lassen.',
      'Den alten Ölfilter mit dem Ölfilterschlüssel abschrauben. Den Gummiring am neuen Filter mit etwas frischem Öl einreiben und den Filter von Hand festschrauben.',
      'Die Ablassschraube mit einem neuen Dichtring einschrauben und mit dem Drehmomentschlüssel nach dem Wert im Handbuch anziehen.',
      'Neues Öl mit dem Trichter einfüllen, so viel wie im Handbuch steht.',
      'Motor kurz laufen lassen, abstellen und ein paar Minuten warten. Dann den Ölstand am Schauglas oder Messstab prüfen, bei Bedarf nachfüllen und schauen, dass nichts tropft.',
    ],
    info: {
      title: 'Wichtig',
      text: 'Altöl gehört nie in den Abfluss oder in den Abfall. Bring es zu einer Sammelstelle, einer Garage oder einem Entsorgungshof. Während der Garantiezeit lässt du den Ölwechsel am besten in der Werkstatt machen, sonst kann die Garantie verfallen.',
    },
    kind: 'diy',
    tasks: ['oil_change', 'oil_filter'],
  },
  reifendruck: {
    title: 'Reifendruck',
    subtitle: 'Luftdruck prüfen',
    icon: 'reifendruck',
    hint: 'Richtwert: alle 2 Wochen und vor jeder längeren Fahrt. Den richtigen Druck für vorne und hinten findest du im Handbuch, oft auch auf einem Aufkleber am Motorrad.',
    stepsTitle: 'So misst du den Reifendruck',
    steps: [
      'Die Ventilkappe am Rad abschrauben und gut aufbewahren.',
      'Den Luftdruckprüfer gerade und fest auf das Ventil drücken, bis es nicht mehr zischt. Dann den Wert ablesen.',
      'Den Wert mit dem richtigen Druck aus dem Handbuch vergleichen. Vorne und hinten sind meist verschieden.',
      'Ist es zu wenig, Luft nachfüllen. Ist es zu viel, kurz auf den Stift im Ventil drücken und etwas Luft ablassen. Danach nochmals messen.',
      'Die Ventilkappe wieder aufschrauben und das Gleiche beim anderen Rad machen.',
    ],
    info: {
      title: 'Gut zu wissen',
      text: 'Viele Tankstellen haben ein Gerät zum Messen und Auffüllen. Mit Beifahrer oder Gepäck braucht es oft etwas mehr Druck, das steht ebenfalls im Handbuch. Zu wenig Druck macht das Motorrad in Kurven schwammig und der Reifen nutzt sich schneller ab.',
    },
    kind: 'diy',
    tasks: ['tire_pressure'],
  },
  reifenprofil: {
    title: 'Reifenprofil',
    subtitle: 'Profil und Alter prüfen',
    icon: 'profilReifen',
    hint: 'Gesetzlich braucht es mindestens 1,6 mm Profil. Für sicheres Fahren, vor allem bei Nässe, lieber früher wechseln.',
    stepsTitle: 'So prüfst du selbst',
    steps: [
      'Das Motorrad gerade hinstellen, am besten auf den Montageständer, damit du das Rad drehen kannst.',
      'Mit einem Profiltiefenmesser an mehreren Stellen in der Mitte des Reifens messen. So ein Messer gibt es günstig im Fachhandel.',
      'In den Rillen sitzen kleine Erhöhungen, die Verschleissanzeiger. Sind sie gleich hoch wie das Profil, ist der Reifen abgefahren.',
      'Das Alter steht auf der Reifenflanke nach den Buchstaben DOT. Die letzten vier Ziffern sind Woche und Jahr: 2321 heisst 23. Woche 2021.',
      'Auf Risse, Beulen, eingefahrene Nägel oder Steine achten.',
    ],
    info: {
      title: 'Wann in die Werkstatt?',
      text: 'Weniger als 1,6 mm Profil, Verschleissanzeiger erreicht, Risse oder Beulen, oder der Reifen ist älter als etwa 5 bis 6 Jahre. Den Richtwert fürs Alter findest du auch beim Reifenhersteller.',
    },
    kind: 'check',
    tasks: ['tire_check'],
  },
  bremsbelaege: {
    title: 'Bremsbeläge',
    subtitle: 'Belagdicke prüfen',
    icon: 'belag',
    hint: 'Prüfe die Beläge regelmässig und vor längeren Touren.',
    stepsTitle: 'So prüfst du selbst',
    steps: [
      'Mit einer Taschenlampe von unten oder hinten in den Bremssattel schauen. Dort siehst du die Beläge auf beiden Seiten der Bremsscheibe.',
      'Viele Beläge haben eine Rille oder Kerbe. Ist sie kaum noch zu sehen, sind die Beläge fast abgefahren.',
      'Als Faustregel gilt: Bei weniger als etwa 2 mm Belag bald wechseln. Den genauen Wert findest du im Handbuch.',
      'Vorne und hinten prüfen, jeweils auf beiden Seiten der Scheibe.',
      'Auf Geräusche achten: Quietscht die Bremse oder schleift sie metallisch, sofort prüfen lassen.',
    ],
    info: {
      title: 'Wann in die Werkstatt?',
      text: 'Belag dünner als etwa 2 mm, Rille nicht mehr sichtbar, metallisches Schleifen oder die Bremse fühlt sich anders an als sonst.',
    },
    kind: 'check',
    tasks: ['brake_pads'],
  },
  bremsfluessigkeit: {
    title: 'Bremsflüssigkeit',
    subtitle: 'Stand und Farbe prüfen',
    icon: 'bremsfl',
    hint: 'Den Stand kannst du regelmässig selbst prüfen. Gewechselt wird meist alle 2 Jahre in der Werkstatt, den genauen Wert findest du im Handbuch.',
    stepsTitle: 'So prüfst du selbst',
    steps: [
      'Das Motorrad gerade hinstellen und den Lenker so drehen, dass der Behälter am Lenker waagrecht steht.',
      'Am Schauglas oder am durchsichtigen Behälter nachschauen: Die Flüssigkeit muss zwischen MIN und MAX stehen.',
      'Den Behälter für die hintere Bremse nicht vergessen. Er sitzt meist rechts in der Nähe der Fussbremse.',
      'Auf die Farbe achten: Frische Bremsflüssigkeit ist hell und klar. Ist sie dunkel oder braun, sollte sie gewechselt werden.',
      'Den Behälter nicht selbst öffnen. Bremsflüssigkeit greift Lack an und darf nicht verschmutzt werden.',
    ],
    info: {
      title: 'Wann in die Werkstatt?',
      text: 'Stand unter MIN, Flüssigkeit dunkel oder braun, Wechsel-Intervall erreicht oder der Bremshebel fühlt sich weich an. Sinkt der Stand, sind oft auch die Bremsbeläge abgenutzt.',
    },
    kind: 'check',
    tasks: [],
  },
  kuehlfluessigkeit: {
    title: 'Kühlflüssigkeit',
    subtitle: 'Stand prüfen',
    icon: 'kuehl',
    hint: 'Nur bei wassergekühlten Motoren. Ob dein Motorrad Kühlflüssigkeit hat und wann sie gewechselt wird, steht im Handbuch.',
    stepsTitle: 'So prüfst du selbst',
    steps: [
      'Nur bei kaltem Motor prüfen. Den Kühlerdeckel nie bei warmem Motor öffnen, es besteht Verbrühungsgefahr.',
      'Das Motorrad gerade hinstellen und den Ausgleichsbehälter suchen. Wo er sitzt, steht im Handbuch.',
      'Der Stand muss zwischen den Markierungen LOW und FULL oder MIN und MAX liegen.',
      'Ist es zu wenig, die Sorte aus dem Handbuch in den Ausgleichsbehälter nachfüllen, nicht direkt in den Kühler.',
      'Unter dem Motorrad auf Flecken oder Tropfen achten.',
    ],
    info: {
      title: 'Wann in die Werkstatt?',
      text: 'Der Stand sinkt immer wieder, es tropft, die Warnleuchte für die Kühlmitteltemperatur leuchtet oder das Wechsel-Intervall ist erreicht.',
    },
    kind: 'check',
    tasks: [],
  },
  batterie: {
    title: 'Batterie',
    subtitle: 'Spannung messen',
    icon: 'batterie',
    hint: 'Vor allem nach dem Winter oder wenn du wenig fährst. Eine Batterie hält einige Jahre, dann lässt sie nach.',
    stepsTitle: 'So prüfst du selbst',
    steps: [
      'Zündung aus. Ein einfaches Messgerät (Multimeter) auf Gleichspannung (V) stellen.',
      'Die rote Spitze an Plus (+), die schwarze an Minus (–) der Batterie halten. Wo die Batterie sitzt, steht im Handbuch.',
      'Etwa 12,6 Volt oder mehr: Die Batterie ist voll.',
      'Unter etwa 12,4 Volt: Die Batterie mit einem passenden Ladegerät laden.',
      'Springt das Motorrad schlecht an, obwohl die Batterie geladen ist, ist sie vielleicht zu alt.',
    ],
    info: {
      title: 'Wann in die Werkstatt?',
      text: 'Die Batterie hält die Ladung nicht mehr, zeigt nach dem Laden deutlich weniger als 12,6 Volt oder das Motorrad springt schlecht an. Bei Lithium-Batterien gelten andere Werte, siehe Handbuch.',
    },
    kind: 'check',
    tasks: [],
  },
};
