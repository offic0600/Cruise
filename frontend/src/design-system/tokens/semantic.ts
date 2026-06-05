export type ThemeName = 'light' | 'dark';

export const semanticTokens = {
  light: {
    bg: {
      canvas: '#f5f7fb',
      canvasMuted: '#edf2f8',
      surface: 'rgba(255, 255, 255, 0.92)',
      subtle: '#f8fafc',
      elevated: '#ffffff',
      overlay: 'rgba(15, 23, 32, 0.34)',
      inverse: '#111827',
      brandSoft: '#eef4ff',
    },
    fg: {
      primary: '#0f1720',
      secondary: '#445569',
      tertiary: '#62748a',
      disabled: '#8ea0b5',
      inverse: '#ffffff',
      brand: '#155eef',
      success: '#027a48',
      warning: '#b54708',
      danger: '#b42318',
      info: '#175cd3',
    },
    border: {
      default: 'rgba(193, 204, 217, 0.72)',
      subtle: 'rgba(217, 224, 234, 0.78)',
      strong: '#c1ccd9',
      focus: 'rgba(21, 94, 239, 0.28)',
      inverse: 'rgba(255, 255, 255, 0.16)',
    },
    fill: {
      brand: '#155eef',
      success: '#039855',
      warning: '#f79009',
      danger: '#d92d20',
      info: '#1570ef',
    },
    interactive: {
      default: '#ffffff',
      hover: '#f8fafc',
      pressed: '#eef2f6',
      selected: '#e9efff',
      disabled: '#eef2f6',
    },
    focus: {
      ring: '0 0 0 4px rgba(41, 112, 255, 0.16)',
      outline: 'rgba(41, 112, 255, 0.32)',
    },
  },
  dark: {
    bg: {
      canvas: '#071018',
      canvasMuted: '#0b1620',
      surface: 'rgba(14, 22, 31, 0.92)',
      subtle: '#101923',
      elevated: '#15212d',
      overlay: 'rgba(2, 6, 23, 0.72)',
      inverse: '#f8fafc',
      brandSoft: 'rgba(21, 94, 239, 0.18)',
    },
    fg: {
      primary: '#f8fafc',
      secondary: '#c1ccd9',
      tertiary: '#8ea0b5',
      disabled: '#62748a',
      inverse: '#071018',
      brand: '#84adff',
      success: '#6ce9a6',
      warning: '#fec84b',
      danger: '#fda29b',
      info: '#84caff',
    },
    border: {
      default: 'rgba(68, 85, 105, 0.72)',
      subtle: 'rgba(50, 65, 82, 0.88)',
      strong: '#445569',
      focus: 'rgba(132, 173, 255, 0.36)',
      inverse: 'rgba(255, 255, 255, 0.2)',
    },
    fill: {
      brand: '#4b97ff',
      success: '#32d583',
      warning: '#fdb022',
      danger: '#f97066',
      info: '#53b1fd',
    },
    interactive: {
      default: '#15212d',
      hover: '#1b2936',
      pressed: '#223444',
      selected: 'rgba(41, 112, 255, 0.24)',
      disabled: '#101923',
    },
    focus: {
      ring: '0 0 0 4px rgba(132, 173, 255, 0.18)',
      outline: 'rgba(132, 173, 255, 0.36)',
    },
  },
} as const;

export type SemanticTokens = typeof semanticTokens;
