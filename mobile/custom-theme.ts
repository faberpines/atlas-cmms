import { MD3LightTheme as DefaultTheme, useTheme } from 'react-native-paper';

export const customTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4a7c2f',
    secondary: '#6b7a54',
    tertiary: '#9DA1A1',
    background: '#eaf2e6',
    secondaryContainer: '#5a6e45',
    success: '#57CA22',
    warning: '#FFA319',
    error: '#FF1943',
    info: '#52b788',
    black: '#1a2e10',
    white: '#ffffff',
    primaryAlt: '#1e4d0f',
    primaryContainer: '#2d5a1a',
    tertiaryContainer: 'black',
    grey: '#676b6b'
  }
};
export const useAppTheme = () => useTheme<typeof customTheme>();
