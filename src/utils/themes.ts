/**
 * Theme definitions and color resolution for the profile card.
 * All hex values are stored WITHOUT the "#" prefix.
 *
 * @author Nayan Das <https://github.com/nayandas69>
 */

/** Color scheme for a single theme */
export interface Theme {
  bg: string;
  title: string;
  text: string;
  icon: string;
  border: string;
}

/**
 * Built-in themes collection organized by category.
 * Each theme provides a complete color palette for the card.
 *
 * Categories:
 * - default: Classic default theme
 * - dark: Deep dark editor themes
 * - light: Light/bright themes
 * - pastel: Soft pastel color schemes
 * - material: Material Design inspired themes
 * - vscode: VSCode editor themes
 * - brand: Platform brand colors
 * - neon: Vibrant/neon themes
 * - natural: Warm/natural color themes
 * - amoled: AMOLED optimized themes
 * - grayscale: Monochrome variations
 */
export interface ThemeCategory {
  [key: string]: Theme;
}

export interface ThemesCollection {
  default: Theme;
  dark: ThemeCategory;
  light: ThemeCategory;
  pastel: ThemeCategory;
  material: ThemeCategory;
  vscode: ThemeCategory;
  brand: ThemeCategory;
  neon: ThemeCategory;
  natural: ThemeCategory;
  amoled: ThemeCategory;
  grayscale: ThemeCategory;
}

// Flatten all themes into a flat structure for backward compatibility
export const themes: Record<string, Theme> = {};

const themeCollections: ThemesCollection = {
  default: {
    bg: 'fffefe',
    title: '2f80ed',
    text: '434d58',
    icon: '4c71f2',
    border: 'e4e2e2',
  },
  dark: {
    dark: {
      bg: '151515',
      title: 'fff',
      text: '9f9f9f',
      icon: '79ff97',
      border: '2a2a2a',
    },
    dracula: {
      bg: '282a36',
      title: 'ff6e96',
      text: 'f8f8f2',
      icon: 'bd93f9',
      border: '44475a',
    },
    monokai: {
      bg: '272822',
      title: 'f92672',
      text: 'f8f8f2',
      icon: 'a6e22e',
      border: '3e3d32',
    },
    nord: {
      bg: '2e3440',
      title: '88c0d0',
      text: 'd8dee9',
      icon: '81a1c1',
      border: '3b4252',
    },
    github_dark: {
      bg: '0d1117',
      title: '58a6ff',
      text: 'c9d1d9',
      icon: '1f6feb',
      border: '21262d',
    },
    slate: {
      bg: '0b1220',
      title: 'e2e8f0',
      text: '94a3b8',
      icon: '38bdf8',
      border: '1f2937',
    },
    midnight: {
      bg: '0f172a',
      title: '38bdf8',
      text: 'cbd5e1',
      icon: '818cf8',
      border: '1e293b',
    },
    highcontrast: {
      bg: '000',
      title: 'e7f216',
      text: 'fff',
      icon: '00ffff',
      border: '333',
    },
  },
  light: {
    pearl: {
      bg: 'f7f7f5',
      title: '1f2328',
      text: '3d444d',
      icon: '0969da',
      border: 'e6e8eb',
    },
    ice: {
      bg: 'f0f9ff',
      title: '0369a1',
      text: '075985',
      icon: '0ea5e9',
      border: 'dbeafe',
    },
    sand: {
      bg: 'fbf7f0',
      title: '6b4e2e',
      text: '7a6754',
      icon: 'd97706',
      border: 'eadfce',
    },
  },
  pastel: {
    pastel_peach: {
      bg: 'fff1f2',
      title: 'fb7185',
      text: '7f1d1d',
      icon: 'fda4af',
      border: 'ffe4e6',
    },
    pastel_mint: {
      bg: 'f0fdf4',
      title: '4ade80',
      text: '14532d',
      icon: '86efac',
      border: 'dcfce7',
    },
    pastel_lavender: {
      bg: 'f5f3ff',
      title: 'a78bfa',
      text: '4c1d95',
      icon: 'c4b5fd',
      border: 'ede9fe',
    },
    pastel_lemon: {
      bg: 'fefce8',
      title: 'facc15',
      text: '713f12',
      icon: 'fde68a',
      border: 'fef9c3',
    },
    pastel_rose: {
      bg: 'fff1f5',
      title: 'f472b6',
      text: '831843',
      icon: 'f9a8d4',
      border: 'fce7f3',
    },
  },
  material: {
    mui_blue: {
      bg: 'e3f2fd',
      title: '1976d2',
      text: '0d47a1',
      icon: '42a5f5',
      border: 'bbdefb',
    },
    mui_indigo: {
      bg: 'e8eaf6',
      title: '3f51b5',
      text: '1a237e',
      icon: '5c6bc0',
      border: 'c5cae9',
    },
    mui_teal: {
      bg: 'e0f2f1',
      title: '00796b',
      text: '004d40',
      icon: '26a69a',
      border: 'b2dfdb',
    },
    mui_deep_purple: {
      bg: 'ede7f6',
      title: '673ab7',
      text: '311b92',
      icon: '9575cd',
      border: 'd1c4e9',
    },
    mui_orange: {
      bg: 'fff3e0',
      title: 'f57c00',
      text: 'e65100',
      icon: 'ff9800',
      border: 'ffe0b2',
    },
    mui_red: {
      bg: 'ffebee',
      title: 'd32f2f',
      text: 'b71c1c',
      icon: 'ef5350',
      border: 'ffcdd2',
    },
  },
  vscode: {
    vscode_dark_plus: {
      bg: '1e1e1e',
      title: '569cd6',
      text: 'd4d4d4',
      icon: 'c586c0',
      border: '2d2d2d',
    },
    vscode_light: {
      bg: 'ffffff',
      title: '0066bf',
      text: '333333',
      icon: '795e26',
      border: 'e5e5e5',
    },
    vscode_monokai_pro: {
      bg: '2d2a2e',
      title: 'ff6188',
      text: 'fcfcfa',
      icon: 'a9dc76',
      border: '403e41',
    },
    vscode_night_owl: {
      bg: '011627',
      title: '82aaff',
      text: 'd6deeb',
      icon: 'c792ea',
      border: '1d3b53',
    },
    vscode_palenight: {
      bg: '292d3e',
      title: 'c792ea',
      text: 'a6accd',
      icon: '89ddff',
      border: '3a3f58',
    },
  },
  brand: {
    twitter: {
      bg: '15202b',
      title: '1da1f2',
      text: 'e1e8ed',
      icon: '1da1f2',
      border: '38444d',
    },
    discord: {
      bg: '2c2f33',
      title: '5865f2',
      text: 'ffffff',
      icon: '99aab5',
      border: '23272a',
    },
    spotify: {
      bg: '121212',
      title: '1db954',
      text: 'b3b3b3',
      icon: '1ed760',
      border: '282828',
    },
    github_light: {
      bg: 'ffffff',
      title: '24292e',
      text: '57606a',
      icon: '0969da',
      border: 'd0d7de',
    },
    youtube: {
      bg: '181818',
      title: 'ff0000',
      text: 'ffffff',
      icon: 'ff4e45',
      border: '303030',
    },
    instagram: {
      bg: '1e1e1e',
      title: 'e1306c',
      text: 'f5f5f5',
      icon: 'fd1d1d',
      border: '2a2a2a',
    },
  },
  neon: {
    radical: {
      bg: '141321',
      title: 'fe428e',
      text: 'a9fef7',
      icon: 'f8d847',
      border: '2a2a40',
    },
    cyberpunk: {
      bg: '14001f',
      title: 'ff00ff',
      text: '00ffff',
      icon: 'fcee0c',
      border: '2a003f',
    },
    synthwave: {
      bg: '2b213a',
      title: 'e2e9ec',
      text: 'e5289e',
      icon: 'ef8539',
      border: '3e2f5a',
    },
    oceanic: {
      bg: '0c1e26',
      title: '00c2ff',
      text: '9be7ff',
      icon: '00ffa3',
      border: '123844',
    },
    mint: {
      bg: '0f1f1c',
      title: '5eead4',
      text: '99f6e4',
      icon: '2dd4bf',
      border: '1b3a34',
    },
    royal: {
      bg: '1a1a2e',
      title: 'ffd700',
      text: 'eaeaea',
      icon: '8a2be2',
      border: '2e2e4d',
    },
  },
  natural: {
    gruvbox: {
      bg: '282828',
      title: 'fabd2f',
      text: 'ebdbb2',
      icon: 'fe8019',
      border: '3c3836',
    },
    merko: {
      bg: '0a0f0b',
      title: 'abd200',
      text: '68b587',
      icon: 'b7d364',
      border: '1a2f1a',
    },
    forest: {
      bg: '0f1b17',
      title: 'b7f7d9',
      text: '86a995',
      icon: '34d399',
      border: '17332a',
    },
    rose: {
      bg: '1a0f14',
      title: 'ffd0dd',
      text: 'e6b0c0',
      icon: 'fb7185',
      border: '2b1a22',
    },
    sunset: {
      bg: '2a1a1f',
      title: 'ff7a59',
      text: 'ffd6c2',
      icon: 'ffb347',
      border: '40252b',
    },
    lavender: {
      bg: '1e1b2e',
      title: 'c084fc',
      text: 'e9d5ff',
      icon: 'a78bfa',
      border: '312e4a',
    },
    ember: {
      bg: '1a0f0f',
      title: 'ff4500',
      text: 'ffb3a7',
      icon: 'ff6347',
      border: '331a1a',
    },
    tokyonight: {
      bg: '1a1b27',
      title: '70a5fd',
      text: '38bdae',
      icon: 'bf91f3',
      border: '2a2b3d',
    },
    onedark: {
      bg: '282c34',
      title: 'e4bf7a',
      text: 'abb2bf',
      icon: '8eb573',
      border: '3e4451',
    },
    cobalt: {
      bg: '193549',
      title: 'e683d9',
      text: '75eeb2',
      icon: '0480ef',
      border: '2a4a6a',
    },
  },
  amoled: {
    amoled_blue: {
      bg: '000000',
      title: '00bfff',
      text: 'b3e5fc',
      icon: '1e90ff',
      border: '0a0a0a',
    },
    amoled_green: {
      bg: '000000',
      title: '00ff7f',
      text: 'ccffcc',
      icon: '00fa9a',
      border: '0d0d0d',
    },
    amoled_purple: {
      bg: '000000',
      title: 'bb86fc',
      text: 'e0c3fc',
      icon: '9d4edd',
      border: '121212',
    },
  },
  grayscale: {
    grayscale_light: {
      bg: 'f5f5f5',
      title: '111111',
      text: '555555',
      icon: '888888',
      border: 'dddddd',
    },
    grayscale_mid: {
      bg: '2b2b2b',
      title: 'ffffff',
      text: 'bbbbbb',
      icon: '999999',
      border: '3c3c3c',
    },
    grayscale_dark: {
      bg: '121212',
      title: 'e0e0e0',
      text: '9e9e9e',
      icon: 'bdbdbd',
      border: '1f1f1f',
    },
  },
};

// Populate flat themes object for backward compatibility with existing code
themes['default'] = themeCollections.default;
Object.entries(themeCollections).forEach(([category, categoryThemes]) => {
  if (category !== 'default' && typeof categoryThemes === 'object') {
    Object.entries(categoryThemes).forEach(([themeName, theme]) => {
      themes[themeName] = theme as Theme;
    });
  }
});

/**
 * Resolves the final color set for a card by merging a base theme
 * with any user-provided color overrides.
 *
 * @param opts - Theme name and optional per-color overrides
 * @returns Complete theme colors to render the card with
 */
export function resolveColors(opts: {
  theme?: string;
  bg_color?: string;
  title_color?: string;
  text_color?: string;
  icon_color?: string;
  border_color?: string;
}): Theme {
  // Fall back to "default" theme if the requested theme doesn't exist
  const base = (opts.theme && themes[opts.theme]) || themes['default']!;

  return {
    bg: opts.bg_color || base.bg,
    title: opts.title_color || base.title,
    text: opts.text_color || base.text,
    icon: opts.icon_color || base.icon,
    border: opts.border_color || base.border,
  };
}
