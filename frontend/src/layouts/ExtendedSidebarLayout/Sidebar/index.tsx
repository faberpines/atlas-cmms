import { useContext } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import {
  alpha,
  Box,
  darken,
  Divider,
  Drawer,
  lighten,
  styled,
  Typography,
  useTheme
} from '@mui/material';
import SidebarMenu from './SidebarMenu';
import SidebarFooter from './SidebarFooter';
import Logo from 'src/components/LogoSign';
import { isWhiteLabeled } from '../../../config';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 64px;
        border-right: 1px solid ${theme.colors.alpha.trueWhite[10]};
`
);

const SidebarBrand = () => (
  <Box sx={{ px: 2.5, pt: 2.25, pb: 1.75, textAlign: 'center' }}>
    <Logo white />
    {!isWhiteLabeled && (
      <Typography
        component="button"
        type="button"
        onClick={() => window.open('https://www.baybabyproduce.com/', '_blank')}
        sx={{
          mt: 0.75,
          p: 0,
          border: 0,
          background: 'none',
          color: 'rgba(255,255,255,.68)',
          font: 'inherit',
          fontSize: 12,
          letterSpacing: '.02em',
          cursor: 'pointer',
          '&:hover': { color: 'common.white' },
          '&:focus-visible': { outline: '2px solid currentColor', outlineOffset: 3 }
        }}
      >
        Powered by Pumpkins 🎃
      </Typography>
    )}
  </Box>
);

function Sidebar() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const closeSidebar = () => toggleSidebar();
  const theme = useTheme();

  return (
    <>
      <SidebarWrapper
        data-print-hide="true"
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background:
            theme.palette.mode === 'dark'
              ? alpha(lighten(theme.header.background, 0.1), 0.5)
              : darken(theme.colors.alpha.black[100], 0.5),
          boxShadow:
            theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none'
        }}
      >
        <Scrollbar>
          <SidebarBrand />
          <Divider
            sx={{
              mt: 0,
              mx: theme.spacing(2),
              background: theme.colors.alpha.trueWhite[10]
            }}
          />
          <SidebarMenu />
        </Scrollbar>
        <Divider
          sx={{
            background: theme.colors.alpha.trueWhite[10]
          }}
        />
        <SidebarFooter />
      </SidebarWrapper>
      <Drawer
        data-print-hide="true"
        sx={{
          boxShadow: `${theme.sidebar.boxShadow}`
        }}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={sidebarToggle}
        onClose={closeSidebar}
        variant="temporary"
        elevation={9}
        ModalProps={{ keepMounted: true }}
      >
        <SidebarWrapper
          sx={{
            background:
              theme.palette.mode === 'dark'
                ? theme.colors.alpha.white[100]
                : darken(theme.colors.alpha.black[100], 0.5)
          }}
        >
          <Scrollbar>
            <SidebarBrand />
            <Divider
              sx={{
                mt: 0,
                mx: theme.spacing(2),
                background: theme.colors.alpha.trueWhite[10]
              }}
            />
            <SidebarMenu />
          </Scrollbar>
          <SidebarFooter />
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;
