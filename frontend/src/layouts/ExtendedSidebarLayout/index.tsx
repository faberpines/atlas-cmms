import { FC, ReactNode } from 'react';
import { alpha, Box, lighten, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';
import Header from './Header';
import AssistantWidget from '../../content/own/components/AssistantWidget';

interface ExtendedSidebarLayoutProps {
  children?: ReactNode;
}

const ExtendedSidebarLayout: FC<ExtendedSidebarLayoutProps> = () => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          flex: 1,
          minHeight: '100vh',
          backgroundColor: 'background.default',

          '.MuiPageTitle-wrapper': {
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.trueWhite[5]
                : theme.colors.alpha.white[50],
            marginBottom: `${theme.spacing(3)}`,
            boxShadow:
              theme.palette.mode === 'dark'
                ? `0 1px 0 ${alpha(
                    lighten(theme.colors.primary.main, 0.7),
                    0.15
                  )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
                : `0px 2px 4px -3px ${alpha(
                    theme.colors.alpha.black[100],
                    0.1
                  )}, 0px 5px 12px -4px ${alpha(
                    theme.colors.alpha.black[100],
                    0.05
                  )}`
          }
        }}
      >
        <Header />
        <Sidebar />
        <Box
          data-print-content="true"
          sx={{
            position: 'relative',
            zIndex: 5,
            display: 'block',
            flex: 1,
            pt: `${theme.header.height}`,
            [theme.breakpoints.up('lg')]: {
              ml: `${theme.sidebar.width}`
            },
            '@media print': {
              ml: '0 !important',
              pt: '0 !important'
            }
          }}
        >
          <Box display="block">
            <Outlet />
          </Box>
          {/*<ThemeSettings />*/}
        </Box>
      </Box>
      <Box data-print-hide="true">
        <AssistantWidget />
      </Box>
    </>
  );
};

export default ExtendedSidebarLayout;
