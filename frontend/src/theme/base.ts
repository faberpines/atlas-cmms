/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app
 * tone: sturdy technical · anchor hue: leaf-green · pre-emit critique: P5 H5 E4 S5 R4 V5
 */
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
        background: '#143923',
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
        background: '#fffdf7',
        boxShadow:
          '0 1px 0 rgba(23, 61, 42, 0.10), 0 8px 24px rgba(23, 61, 42, 0.05)',
        textColor: '#173d2a'
      },
      palette: {
        background: {
          default: '#edf2e9',
          paper: '#fffdf7'
        }
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            html: {
              overflowX: 'clip'
            },
            body: {
              overflowX: 'clip',
              backgroundColor: '#edf2e9'
            },
            '::selection': {
              backgroundColor: 'rgba(226, 112, 57, 0.28)',
              color: '#143923'
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundColor: '#fffdf7',
              border: '1px solid rgba(20, 57, 35, 0.14)',
              borderRadius: 12,
              boxShadow:
                '0 1px 2px rgba(20, 57, 35, 0.05), 0 14px 36px rgba(20, 57, 35, 0.07)'
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none'
            },
            outlined: {
              borderColor: 'rgba(20, 57, 35, 0.14)'
            }
          }
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              borderRadius: 14,
              borderTop: '5px solid #e27039',
              boxShadow: '0 26px 80px rgba(9, 35, 21, 0.24)'
            }
          }
        },
        MuiDialogTitle: {
          styleOverrides: {
            root: {
              padding: '22px 24px 16px',
              color: '#143923',
              fontFamily: 'Georgia, serif',
              fontSize: 24,
              fontWeight: 600
            }
          }
        },
        MuiDrawer: {
          styleOverrides: {
            paper: {
              backgroundColor: '#fffdf7',
              borderLeft: '1px solid rgba(20, 57, 35, 0.14)'
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
            root: {
              minHeight: 42,
              borderRadius: 8,
              fontWeight: 700,
              letterSpacing: '-0.01em',
              textTransform: 'none',
              whiteSpace: 'nowrap'
            },
            containedPrimary: {
              backgroundColor: '#376f3d',
              boxShadow: `0 5px 14px ${alpha('#376f3d', 0.22)}`,
              '&:hover': {
                backgroundColor: '#285a31',
                boxShadow: `0 7px 18px ${alpha('#285a31', 0.25)}`
              },
              '&:active': {
                transform: 'translateY(1px)'
              }
            },
            outlinedPrimary: {
              borderColor: 'rgba(20, 57, 35, 0.28)',
              backgroundColor: '#fffdf7',
              '&:hover': {
                borderColor: '#376f3d',
                backgroundColor: '#edf5e9'
              }
            }
          }
        },
        MuiIconButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              '&:focus-visible': {
                outline: '2px solid #376f3d',
                outlineOffset: 2
              }
            }
          }
        },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              minHeight: 44,
              borderRadius: 8,
              backgroundColor: '#fffdf7',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#769376'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 1,
                borderColor: '#376f3d'
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 3px rgba(55, 111, 61, 0.16)'
              }
            },
            notchedOutline: {
              borderColor: 'rgba(20, 57, 35, 0.22)'
            }
          }
        },
        MuiInputLabel: {
          styleOverrides: {
            root: {
              color: '#526c58',
              fontWeight: 600
            }
          }
        },
        MuiFormHelperText: {
          styleOverrides: {
            root: {
              minHeight: '1lh'
            }
          }
        },
        MuiTabs: {
          styleOverrides: {
            root: {
              minHeight: 44
            },
            indicator: {
              height: 3,
              backgroundColor: '#e27039'
            }
          }
        },
        MuiTab: {
          styleOverrides: {
            root: {
              minHeight: 44,
              borderRadius: 8,
              color: '#526c58',
              fontWeight: 700,
              textTransform: 'none',
              whiteSpace: 'nowrap',
              '&.Mui-selected': {
                color: '#143923',
                backgroundColor: '#e7efe3'
              }
            }
          }
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 6,
              fontWeight: 700
            }
          }
        },
        MuiTableContainer: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              border: '1px solid rgba(20, 57, 35, 0.12)'
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
