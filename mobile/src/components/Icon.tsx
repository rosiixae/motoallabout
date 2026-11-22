import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

// Icons aus dem Prototyp (24×24, Strich-Icons).
export type IconName =
  | 'home'
  | 'tipps'
  | 'motorrad'
  | 'kalender'
  | 'profil'
  | 'kette'
  | 'service'
  | 'oel'
  | 'ventil'
  | 'kardan'
  | 'riemen'
  | 'reifendruck'
  | 'profilReifen'
  | 'belag'
  | 'bremsfl'
  | 'batterie'
  | 'mfk'
  | 'kuehl'
  | 'winter'
  | 'fruehling'
  | 'filter'
  | 'zuendkerze'
  | 'luftfilter'
  | 'variomatik'
  | 'plus'
  | 'zurueck'
  | 'weiter'
  | 'check'
  | 'warnung'
  | 'link'
  | 'kamera'
  | 'auspuff'
  | 'spiegel'
  | 'blinker'
  | 'heck'
  | 'sattel'
  | 'design';

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function Icon({ name, size = 24, color = '#16191D', strokeWidth = 2 }: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes(name)}
    </Svg>
  );
}

function shapes(name: IconName) {
  switch (name) {
    case 'home':
      return (
        <>
          <Path d="M3 11l9-7 9 7" />
          <Path d="M5 10v10h14V10" />
        </>
      );
    case 'tipps':
      return (
        <>
          <Rect x="4" y="3" width="16" height="18" rx="2" />
          <Path d="M9 3v18" />
        </>
      );
    case 'motorrad':
      return (
        <>
          <Circle cx="5" cy="16.5" r="3.5" />
          <Circle cx="19" cy="16.5" r="3.5" />
          <Path d="M5 16.5l4-5.5h7" />
          <Path d="M19 16.5l-3.5-9" />
          <Path d="M14 7.5h3" />
          <Path d="M3 9.5h6l2.5-1.5h4" />
          <Rect x="9.5" y="11" width="4" height="3" rx="0.5" />
        </>
      );
    case 'kalender':
      return (
        <>
          <Rect x="3" y="5" width="18" height="16" rx="2" />
          <Path d="M3 10h18M8 3v4M16 3v4" />
        </>
      );
    case 'profil':
      return (
        <>
          <Circle cx="12" cy="8" r="4" />
          <Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </>
      );
    case 'kette':
      return (
        <>
          <Path d="M10 14l-2 2a3 3 0 0 1-4.2-4.2l3-3a3 3 0 0 1 4.2 0" />
          <Path d="M14 10l2-2a3 3 0 0 1 4.2 4.2l-3 3a3 3 0 0 1-4.2 0" />
          <Path d="M9.5 14.5l5-5" />
        </>
      );
    case 'service':
      return <Path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-.5-.5-2.5z" />;
    case 'oel':
      return (
        <>
          <Path d="M3 10h3.5l1.5-2h3l1 2h4l5-2.5-5.5 8.5H5z" />
          <Path d="M9.5 8V6.5M8 6.5h3" />
          <Path d="M21 12.5c.7 1 1 1.6 1 2.1a1 1 0 0 1-2 0c0-.5.3-1.1 1-2.1z" />
        </>
      );
    case 'filter':
      return (
        <>
          <Rect x="6" y="4" width="12" height="16" rx="3" />
          <Path d="M6 9h12M6 15h12M10 9v6M14 9v6" />
        </>
      );
    case 'ventil':
      return (
        <>
          <Path d="M12 3v11" />
          <Path d="M6 19c0-2.8 2.7-5 6-5s6 2.2 6 5z" />
          <Path d="M9 6h6" />
        </>
      );
    case 'kardan':
      return (
        <>
          <Circle cx="5.5" cy="12" r="3" />
          <Circle cx="18.5" cy="12" r="3" />
          <Path d="M8.5 12h7M11 9.5v5M13 9.5v5" />
        </>
      );
    case 'riemen':
    case 'variomatik':
      return (
        <>
          <Rect x="2.5" y="7" width="19" height="10" rx="5" />
          <Circle cx="7.5" cy="12" r="2" />
          <Circle cx="16.5" cy="12" r="2" />
        </>
      );
    case 'reifendruck':
      return (
        <>
          <Path d="M7 19.5c-2-1.8-3.2-4.5-3.2-7.5S5 6.3 7 4.5M17 19.5c2-1.8 3.2-4.5 3.2-7.5S19 6.3 17 4.5M5.5 21h13" />
          <Path d="M12 7.5v6" />
          <Path d="M12 16.5v.1" />
        </>
      );
    case 'profilReifen':
      return (
        <>
          <Circle cx="12" cy="12" r="7.5" />
          <Circle cx="12" cy="12" r="3" />
          <Path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
        </>
      );
    case 'belag':
      return (
        <>
          <Circle cx="10" cy="12" r="7" />
          <Circle cx="10" cy="12" r="2" />
          <Path d="M16.5 6c2.2 1.5 3.5 3.6 3.5 6s-1.3 4.5-3.5 6" />
        </>
      );
    case 'bremsfl':
      return (
        <>
          <Circle cx="12" cy="12" r="6" />
          <Path d="M12 9v3.5M12 15v.1" />
          <Path d="M5 6.5a8.5 8.5 0 0 0 0 11M19 6.5a8.5 8.5 0 0 1 0 11" />
        </>
      );
    case 'batterie':
      return (
        <>
          <Rect x="3" y="8" width="18" height="11" rx="1.5" />
          <Path d="M6.5 8V6h3v2M14.5 8V6h3v2M7 13.5h3M14 13.5h3M15.5 12v3" />
        </>
      );
    case 'mfk':
      return (
        <>
          <Rect x="5" y="4" width="14" height="17" rx="2" />
          <Path d="M9 3h6v3H9z" />
          <Path d="M9 13l2 2 4-4" />
        </>
      );
    case 'kuehl':
      return (
        <>
          <Path d="M12 3v10" />
          <Circle cx="12" cy="15" r="2.4" />
          <Path d="M12 5h3M12 8h3M12 11h3" />
          <Path d="M3 20.5c1.5-1.2 3 1.2 4.5 0s3 1.2 4.5 0 3 1.2 4.5 0 3 1.2 4.5 0" />
        </>
      );
    case 'winter':
      return (
        <Path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9M9.5 4.5L12 7l2.5-2.5M9.5 19.5L12 17l2.5 2.5M4 11l3.2-1.5L6.5 6M20 13l-3.2 1.5.7 3.5M20 11l-3.2-1.5.7-3.5M4 13l3.2 1.5-.7 3.5" />
      );
    case 'fruehling':
      return (
        <>
          <Circle cx="12" cy="12" r="4" />
          <Path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      );
    case 'zuendkerze':
      return (
        <>
          <Path d="M10 2h4v4h-4z" />
          <Path d="M9 6h6v5H9z" />
          <Path d="M10.5 11h3v6h-3zM12 17v3M10 20h4" />
        </>
      );
    case 'luftfilter':
      return (
        <>
          <Path d="M3 8h13a3 3 0 1 0-3-3" />
          <Path d="M3 12h17a3 3 0 1 1-3 3" />
          <Path d="M3 16h8" />
        </>
      );
    case 'plus':
      return <Path d="M12 5v14M5 12h14" />;
    case 'zurueck':
      return <Path d="M15 5l-7 7 7 7" />;
    case 'weiter':
      return <Path d="M9 5l7 7-7 7" />;
    case 'check':
      return <Path d="M5 12l5 5 9-10" />;
    case 'warnung':
      return (
        <>
          <Path d="M12 3l10 18H2z" />
          <Path d="M12 10v5M12 18v.1" />
        </>
      );
    case 'link':
      return (
        <>
          <Path d="M14 4h6v6" />
          <Path d="M20 4l-9 9" />
          <Path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
        </>
      );
    case 'kamera':
      return (
        <>
          <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
          <Circle cx="12" cy="13" r="3.5" />
        </>
      );
    case 'auspuff':
      return (
        <>
          <Path d="M3 14h12l5-3v6l-5-3" />
          <Path d="M6 14v-3h6v3" />
        </>
      );
    case 'spiegel':
      return (
        <>
          <Ellipse cx="9" cy="8" rx="6" ry="4" />
          <Path d="M13 11l5 9" />
        </>
      );
    case 'blinker':
      return (
        <>
          <Path d="M4 9h6l6-4v14l-6-4H4z" />
          <Path d="M19 9l2-1M19 15l2 1" />
        </>
      );
    case 'heck':
      return (
        <>
          <Path d="M3 15h9l8-7" />
          <Path d="M12 15l2 4" />
          <Path d="M17 11h3" />
        </>
      );
    case 'sattel':
      return <Path d="M3 12c3 0 5-3 9-3s6 3 9 3v3H3z" />;
    case 'design':
      return (
        <>
          <Path d="M14 4l6 6-8 8H6v-6z" />
          <Path d="M4 21h5" />
        </>
      );
  }
}
