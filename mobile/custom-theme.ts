/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md · designed-as-app */
/* Hallmark · pre-emit critique: P4 H4 E4 S5 R4 V4 · contrast: pass · responsive: pass */
import { MD3LightTheme as DefaultTheme, useTheme } from 'react-native-paper';

export const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a7c2f',
    secondary: '#6b7a54',
    tertiary: '#9DA1A1',
    background: '#eef4ea',
    surface: '#fbfcf8',
    surfaceVariant: '#e3ecde',
    onSurface: '#20341a',
    onSurfaceVariant: '#52634b',
    outline: '#aebfaa',
    outlineVariant: '#d4dfcf',
    secondaryContainer: '#5a6e45',
    success: '#57CA22',
    warning: '#FFA319',
    error: '#FF1943',
    info: '#52b788',
    black: '#172713',
    white: '#fbfcf8',
    primaryAlt: '#1e4d0f',
    primaryContainer: '#2d5a1a',
    tertiaryContainer: '#172713',
    grey: '#5f6b5a',
    chassis: '#16380d',
    chassisRaised: '#214b16',
    seasonal: '#e27039',
    focus: '#315f20',
    paper: '#fbfcf8',
    paperMuted: '#f4f8f1',
    rule: '#cbd8c4'
  }
};
export const useAppTheme = () => useTheme<typeof customTheme>();
