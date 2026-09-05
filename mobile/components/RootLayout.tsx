import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../custom-theme';

export function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.chassis }}
      edges={['top', 'bottom']}
    >
      {children}
    </SafeAreaView>
  );
}
