import React from 'react';

import { alpha, createTheme, Theme } from '@mui/material';
import { PureLightTheme } from './schemes/PureLightTheme';
import { GreyGooseTheme } from './schemes/GreyGooseTheme';
import { PurpleFlowTheme } from './schemes/PurpleFlowTheme';

export function themeCreator(theme: string): Theme {
  const selectedTheme = themeMap[theme] || PureLightTheme;

  // The application chrome is part of the Atlas identity, rather than a colour
  // scheme.  Apply it after the user's selected scheme so an existing
  // localStorage preference cannot leave them on the legacy white shell.
  return createTheme(
    selectedTheme,
    {
      sidebar: {
        ...selectedTheme.sidebar,
        background: '#173d2a',
        boxShadow: '4px 0 24px rgba(13, 43, 29, 0.16)',
        textColor: '#eef7f0',
        dividerBg: 'rgba(255, 255, 255, 0.12)',
        menuItemColor: '#dcebe0',
        menuItemColorActive: '#ffffff',
        menuItemBg: 'transparent',
        menuItemBgActive: '#4a7c2f',
        menuItemIconColor: '#a9c9b1',
        menuItemIconColorActive: '#ffffff',
        menuItemHeadingColor: '#92b49b'
      },
      header: {
        ...selectedTheme.header,
        background: '#fffefb',
        boxShadow:
          '0 1px 0 rgba(23, 61, 42, 0.10), 0 8px 24px rgba(23, 61, 42, 0.05)',
        textColor: '#173d2a'
      },
      palette: {
        background: {
          default: '#f2f5ef',
          paper: '#fffefb'
        }
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: '#f2f5ef'
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: '#fffefb',
              border: '1px solid rgba(23, 61, 42, 0.10)',
              boxShadow:
                '0 1px 2px rgba(23, 61, 42, 0.04), 0 10px 28px rgba(23, 61, 42, 0.06)'
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            outlined: {
              borderColor: 'rgba(23, 61, 42, 0.12)'
            }
          }
        },
        MuiTableRow: {
          styleOverrides: {
            head: {
              backgroundColor: '#e9efe6'
            }
          }
        },
        MuiTableCell: {
          styleOverrides: {
            head: {
              color: '#315340',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            containedPrimary: {
              boxShadow: `0 4px 12px ${alpha('#4a7c2f', 0.2)}`
            }
          }
        }
      }
    } as any
  );
}

declare module '@mui/material/styles' {
  interface Theme {
    colors: {
      gradients: {
        blue1: string;
        blue2: string;
        blue3: string;
        blue4: string;
        blue5: string;
        orange1: string;
        orange2: string;
        orange3: string;
        purple1: string;
        purple3: string;
        pink1: string;
        pink2: string;
        green1: string;
        green2: string;
        black1: string;
        black2: string;
      };
      shadows: {
        success: string;
        error: string;
        primary: string;
        warning: string;
        info: string;
      };
      alpha: {
        white: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        trueWhite: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        black: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
      };
      secondary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      primary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      success: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      warning: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      error: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      info: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
    };
    general: {
      reactFrameworkColor: React.CSSProperties['color'];
      borderRadiusSm: string;
      borderRadius: string;
      borderRadiusLg: string;
      borderRadiusXl: string;
    };
    sidebar: {
      background: React.CSSProperties['color'];
      boxShadow: React.CSSProperties['color'];
      width: string;
      textColor: React.CSSProperties['color'];
      dividerBg: React.CSSProperties['color'];
      menuItemColor: React.CSSProperties['color'];
      menuItemColorActive: React.CSSProperties['color'];
      menuItemBg: React.CSSProperties['color'];
      menuItemBgActive: React.CSSProperties['color'];
      menuItemIconColor: React.CSSProperties['color'];
      menuItemIconColorActive: React.CSSProperties['color'];
      menuItemHeadingColor: React.CSSProperties['color'];
    };
    header: {
      height: string;
      background: React.CSSProperties['color'];
      boxShadow: React.CSSProperties['color'];
      textColor: React.CSSProperties['color'];
    };
  }

  interface ThemeOptions {
    colors: {
      gradients: {
        blue1: string;
        blue2: string;
        blue3: string;
        blue4: string;
        blue5: string;
        orange1: string;
        orange2: string;
        orange3: string;
        purple1: string;
        purple3: string;
        pink1: string;
        pink2: string;
        green1: string;
        green2: string;
        black1: string;
        black2: string;
      };
      shadows: {
        success: string;
        error: string;
        primary: string;
        warning: string;
        info: string;
      };
      alpha: {
        white: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        trueWhite: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
        black: {
          5: string;
          10: string;
          30: string;
          50: string;
          70: string;
          100: string;
        };
      };
      secondary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      primary: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      success: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      warning: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      error: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
      info: {
        lighter: string;
        light: string;
        main: string;
        dark: string;
      };
    };

    general: {
      reactFrameworkColor: React.CSSProperties['color'];
      borderRadiusSm: string;
      borderRadius: string;
      borderRadiusLg: string;
      borderRadiusXl: string;
    };
    sidebar: {
      background: React.CSSProperties['color'];
      boxShadow: React.CSSProperties['color'];
      width: string;
      textColor: React.CSSProperties['color'];
      dividerBg: React.CSSProperties['color'];
      menuItemColor: React.CSSProperties['color'];
      menuItemColorActive: React.CSSProperties['color'];
      menuItemBg: React.CSSProperties['color'];
      menuItemBgActive: React.CSSProperties['color'];
      menuItemIconColor: React.CSSProperties['color'];
      menuItemIconColorActive: React.CSSProperties['color'];
      menuItemHeadingColor: React.CSSProperties['color'];
    };
    header: {
      height: string;
      background: React.CSSProperties['color'];
      boxShadow: React.CSSProperties['color'];
      textColor: React.CSSProperties['color'];
    };
  }
}

const themeMap: { [key: string]: Theme } = {
  PureLightTheme,
  GreyGooseTheme,
  PurpleFlowTheme
};
