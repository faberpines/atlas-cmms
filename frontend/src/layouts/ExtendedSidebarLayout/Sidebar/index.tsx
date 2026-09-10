import { FocusEvent, useContext, useState } from 'react';
import Scrollbar from 'src/components/Scrollbar';
import { SidebarContext } from 'src/contexts/SidebarContext';

import {
  Box,
  Divider,
  Drawer,
  styled,
  Typography,
  useTheme
} from '@mui/material';
import SidebarMenu from './SidebarMenu';
import Logo from 'src/components/LogoSign';
import { isWhiteLabeled } from '../../../config';
import { DESKTOP_SIDEBAR_RAIL_WIDTH } from '../constants';

const SidebarWrapper = styled(Box)(
  ({ theme }) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 0;
        border-right: 1px solid ${theme.colors.alpha.trueWhite[10]};
        overflow: hidden;
        transition: width 220ms cubic-bezier(0.16, 1, 0.3, 1),
          min-width 220ms cubic-bezier(0.16, 1, 0.3, 1),
          box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1);

        &.desktop-sidebar:not(.is-expanded) {
          width: ${DESKTOP_SIDEBAR_RAIL_WIDTH}px;
          min-width: ${DESKTOP_SIDEBAR_RAIL_WIDTH}px;

          .sidebar-brand {
            padding-left: 0;
            padding-right: 0;
          }

          .sidebar-brand-logo {
            width: ${DESKTOP_SIDEBAR_RAIL_WIDTH}px;
          }

          .sidebar-brand-logo > a,
          .sidebar-brand-logo > a > div {
            width: ${DESKTOP_SIDEBAR_RAIL_WIDTH}px;
          }

          .sidebar-brand-logo img {
            max-width: 58px !important;
            max-height: 42px !important;
          }

          .sidebar-brand-caption,
          .MuiListSubheader-root,
          .MuiButton-endIcon,
          .MuiCollapse-root,
          .MuiBadge-root {
            opacity: 0;
            pointer-events: none;
          }

          .sidebar-menu-label {
            position: absolute;
            width: 0;
            height: 0;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
          }

          .MuiList-root {
            padding-left: 10px;
            padding-right: 10px;
          }

          .MuiListItem-root .MuiButton-root {
            min-width: 0;
            justify-content: center;
            padding-left: 0;
            padding-right: 0;
          }

          .MuiListItem-root .MuiButton-startIcon {
            flex: 0 0 24px;
            width: 24px;
            margin-left: 0;
            margin-right: 0;

            .MuiSvgIcon-root {
              width: 22px;
              height: 22px;
            }
          }

        }

        .sidebar-brand-logo,
        .sidebar-brand-caption,
        .sidebar-menu-label,
        .MuiButton-endIcon,
        .MuiBadge-root {
          transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 140ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (prefers-reduced-motion: reduce) {
          transition-duration: 100ms;

          .sidebar-brand-logo,
          .sidebar-brand-caption,
          .sidebar-menu-label,
          .MuiButton-endIcon,
          .MuiBadge-root {
            transition-duration: 100ms;
          }
        }
`
);

const SidebarBrand = () => (
  <Box
    className="sidebar-brand"
    sx={{ px: 2.5, pt: 2.25, pb: 1.75, textAlign: 'center' }}
  >
    <Box className="sidebar-brand-logo">
      <Logo white />
    </Box>
    {!isWhiteLabeled && (
      <Typography
        component="button"
        className="sidebar-brand-caption"
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
          '&:focus-visible': {
            outline: '2px solid currentColor',
            outlineOffset: 3
          }
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
  const [desktopExpanded, setDesktopExpanded] = useState(false);

  const handleDesktopBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDesktopExpanded(false);
    }
  };

  return (
    <>
      <SidebarWrapper
        className={`desktop-sidebar${desktopExpanded ? ' is-expanded' : ''}`}
        data-print-hide="true"
        aria-label="Primary navigation"
        onMouseEnter={() => setDesktopExpanded(true)}
        onMouseLeave={() => setDesktopExpanded(false)}
        onFocusCapture={() => setDesktopExpanded(true)}
        onBlurCapture={handleDesktopBlur}
        sx={{
          display: {
            xs: 'none',
            lg: 'inline-block'
          },
          position: 'fixed',
          left: 0,
          top: 0,
          background: theme.sidebar.background,
          boxShadow: desktopExpanded
            ? '12px 0 30px rgba(9, 32, 18, 0.28)'
            : theme.sidebar.boxShadow
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
            background: theme.sidebar.background
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
        </SidebarWrapper>
      </Drawer>
    </>
  );
}

export default Sidebar;
