import React from 'react';
import Svg, { Path, Rect, Circle, Polygon } from 'react-native-svg';
import { colors } from '../theme/colors';

export type IconName =
  | 'home'
  | 'home-outline'
  | 'reels'
  | 'reels-outline'
  | 'explore'
  | 'explore-outline'
  | 'create'
  | 'inbox'
  | 'inbox-outline'
  | 'profile'
  | 'profile-outline'
  | 'heart'
  | 'heart-outline'
  | 'comment'
  | 'bookmark'
  | 'bookmark-outline'
  | 'share'
  | 'search'
  | 'settings'
  | 'bell'
  | 'back'
  | 'close'
  | 'check'
  | 'verified'
  | 'live'
  | 'call'
  | 'mic'
  | 'mic-off'
  | 'camera'
  | 'camera-flip'
  | 'filter'
  | 'shield'
  | 'volume-high'
  | 'volume-mute'
  | 'play'
  | 'pause'
  | 'chevron-right'
  | 'more-vertical'
  | 'lock'
  | 'paperclip'
  | 'send'
  | 'trash'
  | 'plus'
  | 'download'
  | 'globe';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  fill?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 22,
  color = colors.light.text,
  fill,
}) => {
  const strokeColor = color;
  const fillColor = fill || 'none';

  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
            fill={color}
          />
        </Svg>
      );

    case 'home-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'reels':
    case 'reels-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="3"
            y="4"
            width="18"
            height="16"
            rx="3"
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <Path
            d="M10 9L15 12L10 15V9Z"
            fill={name === 'reels' ? color : 'none'}
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <Path d="M7 4L11 8" stroke={strokeColor} strokeWidth="1.5" />
          <Path d="M13 4L17 8" stroke={strokeColor} strokeWidth="1.5" />
        </Svg>
      );

    case 'explore':
    case 'explore-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1.8" />
          <Polygon
            points="14.5,9.5 13,13 9.5,14.5 11,11"
            fill={name === 'explore' ? color : 'none'}
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'create':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="3" width="18" height="18" rx="5" stroke={strokeColor} strokeWidth="1.8" />
          <Path d="M12 8V16M8 12H16" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    case 'inbox':
    case 'inbox-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
            fill={name === 'inbox' ? color : 'none'}
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'profile':
    case 'profile-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle
            cx="12"
            cy="8"
            r="4"
            fill={name === 'profile' ? color : 'none'}
            stroke={strokeColor}
            strokeWidth="1.8"
          />
          <Path
            d="M5 20C5 16.6863 8.13401 14 12 14C15.866 14 19 16.6863 19 20"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill={color}
            stroke={strokeColor}
            strokeWidth="1.2"
          />
        </Svg>
      );

    case 'heart-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'comment':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 14.5C20 15.3284 19.3284 16 18.5 16H8L4 20V5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V14.5Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path d="M8 9H16M8 12H13" stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round" />
        </Svg>
      );

    case 'bookmark':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 3H18C18.5523 3 19 3.44772 19 4V21L12 17.5L5 21V4C5 3.44772 5.44772 3 6 3Z"
            fill={color}
            stroke={strokeColor}
            strokeWidth="1.5"
          />
        </Svg>
      );

    case 'bookmark-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 3H18C18.5523 3 19 3.44772 19 4V21L12 17.5L5 21V4C5 3.44772 5.44772 3 6 3Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 12V20H20V12"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M16 6L12 2L8 6M12 2V15"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="11" cy="11" r="7" stroke={strokeColor} strokeWidth="1.8" />
          <Path d="M16 16L21 21" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );

    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3" stroke={strokeColor} strokeWidth="1.8" />
          <Path
            d="M19.4 15A1.65 1.65 0 0 0 20 16.3L20.8 17.1A1 1 0 0 1 20.8 18.5L18.5 20.8A1 1 0 0 1 17.1 20.8L16.3 20A1.65 1.65 0 0 0 15 19.4A1.65 1.65 0 0 0 13.7 20L13.3 21.1A1 1 0 0 1 12.3 21.8H9.7A1 1 0 0 1 8.7 21.1L8.3 20A1.65 1.65 0 0 0 7 19.4A1.65 1.65 0 0 0 5.7 20L4.9 20.8A1 1 0 0 1 3.5 20.8L1.2 18.5A1 1 0 0 1 1.2 17.1L2 16.3A1.65 1.65 0 0 0 2.6 15A1.65 1.65 0 0 0 2 13.7L0.9 13.3A1 1 0 0 1 0.2 12.3V9.7A1 1 0 0 1 0.9 8.7L2 8.3A1.65 1.65 0 0 0 2.6 7A1.65 1.65 0 0 0 2 5.7L1.2 4.9A1 1 0 0 1 1.2 3.5L3.5 1.2A1 1 0 0 1 4.9 1.2L5.7 2A1.65 1.65 0 0 0 7 2.6A1.65 1.65 0 0 0 8.3 2L8.7 0.9A1 1 0 0 1 9.7 0.2H12.3A1 1 0 0 1 13.3 0.9L13.7 2A1.65 1.65 0 0 0 15 2.6A1.65 1.65 0 0 0 16.3 2L17.1 1.2A1 1 0 0 1 18.5 1.2L20.8 3.5A1 1 0 0 1 20.8 4.9L20 5.7A1.65 1.65 0 0 0 19.4 7A1.65 1.65 0 0 0 20 8.3L21.1 8.7A1 1 0 0 1 21.8 9.7V12.3A1 1 0 0 1 21.1 13.3L20 13.7A1.65 1.65 0 0 0 19.4 15Z"
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'bell':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 8A6 6 0 0 0 6 8C6 15 3 17 3 17H21S18 15 18 8"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M13.73 21A2 2 0 0 1 10.27 21"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M15 19L8 12L15 5"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M18 6L6 18M6 6L18 18"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 6L9 17L4 12"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'verified':
      // Classical Islamic 8-Point Star (Rub el Hizb) with verified check
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="1.5"
            fill={colors.light.accent}
            transform="rotate(0 12 12)"
          />
          <Rect
            x="4"
            y="4"
            width="16"
            height="16"
            rx="1.5"
            fill={colors.light.accent}
            transform="rotate(45 12 12)"
          />
          <Path
            d="M9 12L11 14.5L15.5 9.5"
            stroke={colors.light.accentText}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'live':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="3.5" fill={color} />
          <Path
            d="M4.93 4.93C3.12 6.74 2 9.24 2 12C2 14.76 3.12 17.26 4.93 19.07M19.07 4.93C20.88 6.74 22 9.24 22 12C22 14.76 20.88 17.26 19.07 19.07"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <Path
            d="M7.76 7.76C6.67 8.85 6 10.35 6 12C6 13.65 6.67 15.15 7.76 16.24M16.24 7.76C17.33 8.85 18 10.35 18 12C18 13.65 17.33 15.15 16.24 16.24"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      );

    case 'call':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="2" y="5" width="14" height="14" rx="3" stroke={strokeColor} strokeWidth="1.8" />
          <Polygon
            points="16,10 22,6.5 22,17.5 16,14"
            fill={name === 'call' ? color : 'none'}
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'mic':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="9" y="3" width="6" height="11" rx="3" stroke={strokeColor} strokeWidth="1.8" />
          <Path d="M5 10V11C5 14.866 8.13401 18 12 18C15.866 18 19 14.866 19 11V10" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M12 18V21M8 21H16" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'mic-off':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M1 1L23 23M9 9V14C9 15.6569 10.3431 17 12 17C13.6569 17 15 15.6569 15 14V10" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M5 10V11C5 14.866 8.13401 18 12 18M19 11V10" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
          <Path d="M12 18V21M8 21H16" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'camera':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx="12" cy="13" r="4" stroke={strokeColor} strokeWidth="1.8" />
        </Svg>
      );

    case 'camera-flip':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M20 7H4M4 7L8 3M4 7L8 11M4 17H20M20 17L16 13M20 17L16 21"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'filter':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'shield':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 22S20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'volume-high':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={strokeColor} />
          <Path d="M15.54 8.46C16.48 9.4 17 10.66 17 12C17 13.34 16.48 14.6 15.54 15.54M19.07 4.93C20.94 6.8 22 9.33 22 12C22 14.67 20.94 17.2 19.07 19.07" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'volume-mute':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill={strokeColor} />
          <Path d="M23 9L17 15M17 9L23 15" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Polygon points="5,3 19,12 5,21" fill={color} />
        </Svg>
      );

    case 'pause':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="6" y="4" width="4" height="16" rx="1" fill={color} />
          <Rect x="14" y="4" width="4" height="16" rx="1" fill={color} />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M9 18L15 12L9 6" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      );

    case 'more-vertical':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="5" r="1.5" fill={color} />
          <Circle cx="12" cy="12" r="1.5" fill={color} />
          <Circle cx="12" cy="19" r="1.5" fill={color} />
        </Svg>
      );

    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Rect x="3" y="11" width="18" height="11" rx="2" stroke={strokeColor} strokeWidth="1.8" />
          <Path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke={strokeColor} strokeWidth="1.8" strokeLinecap="round" />
        </Svg>
      );

    case 'paperclip':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21.44 11.05L12.25 20.24C11.12 21.36 9.6 22 8 22C6.4 22 4.88 21.36 3.76 20.24C2.63 19.12 2 17.6 2 16C2 14.4 2.63 12.88 3.76 11.76L12.95 2.57C13.7 1.82 14.71 1.4 15.78 1.4C16.84 1.4 17.86 1.82 18.61 2.57C19.36 3.32 19.78 4.34 19.78 5.4C19.78 6.47 19.36 7.48 18.61 8.24L9.41 17.43C9.04 17.81 8.53 18.02 8 18.02C7.47 18.02 6.96 17.81 6.59 17.43C6.21 17.06 6 16.55 6 16.02C6 15.49 6.21 14.98 6.59 14.61L15.07 6.13"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'send':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M22 2L11 13"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M22 2L15 22L11 13L2 9L22 2Z"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={fillColor}
          />
        </Svg>
      );

    case 'trash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M3 6H5H21"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5V19M5 12H19"
            stroke={strokeColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'download':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M21 15V19C21 19.5523 20.5523 20 20 20H4C3.44772 20 3 19.5523 3 19V15M7 10L12 15M12 15L17 10M12 15V3"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'globe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Circle cx="12" cy="12" r="9" stroke={strokeColor} strokeWidth="1.8" />
          <Path
            d="M3.6 9H20.4M3.6 15H20.4M12 3C10 5.5 8.8 8.6 8.8 12C8.8 15.4 10 18.5 12 21M12 3C14 5.5 15.2 8.6 15.2 12C15.2 15.4 14 18.5 12 21"
            stroke={strokeColor}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    default:
      return null;
  }
};
