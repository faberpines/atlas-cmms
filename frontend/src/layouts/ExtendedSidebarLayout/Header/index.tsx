import { useContext } from 'react';

import {
  alpha,
  Box,
  Divider,
  IconButton,
  Stack,
  styled,
  Tooltip,
  Typography
} from '@mui/material';
import MenuTwoToneIcon from '@mui/icons-material/MenuTwoTone';
import { SidebarContext } from 'src/contexts/SidebarContext';
import ArrowBackTwoToneIcon from '@mui/icons-material/ArrowBackTwoTone';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';

import HeaderButtons from './Buttons';
import HeaderUserbox from './Userbox';
import { useTranslation } from 'react-i18next';
import { TitleContext } from '../../../contexts/TitleContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { DESKTOP_SIDEBAR_RAIL_WIDTH } from '../constants';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2.5)};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme.header.background, 0.98)};
        backdrop-filter: blur(10px);
        border-bottom: 1px solid ${theme.palette.divider};
        border-top: 4px solid #e27039;
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values.lg}px) {
            left: ${DESKTOP_SIDEBAR_RAIL_WIDTH}px;
            width: auto;
        }
`
);

function Header() {
  const { sidebarToggle, toggleSidebar } = useContext(SidebarContext);
  const { title } = useContext(TitleContext);
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <HeaderWrapper
      data-print-hide="true"
      display="flex"
      alignItems="center"
      sx={{
        boxShadow: '0 2px 10px rgba(24, 45, 32, 0.04)'
      }}
    >
      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        alignItems="center"
        spacing={1.5}
      >
        <IconButton
          aria-label={t('back')}
          onClick={() => navigate(-1)}
          disabled={location.key === 'default'}
          sx={{ width: 44, height: 44 }}
        >
          <ArrowBackTwoToneIcon />
        </IconButton>
        <Typography
          variant="h2"
          noWrap
          sx={{ fontSize: { xs: 18, sm: 21 }, fontWeight: 700 }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            display: { xs: 'none', md: 'block' },
            color: 'text.secondary',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase'
          }}
        >
          Atlas operations
        </Typography>
      </Stack>
      <Box display="flex" alignItems="center">
        <HeaderButtons />
        <HeaderUserbox />
        <Box
          component="span"
          sx={{
            ml: 2,
            display: { lg: 'none', xs: 'inline-block' }
          }}
        >
          <Tooltip arrow title={t('toggle_menu')}>
            <IconButton
              aria-label={t('toggle_menu')}
              color="primary"
              onClick={toggleSidebar}
              sx={{ width: 44, height: 44 }}
            >
              {!sidebarToggle ? (
                <MenuTwoToneIcon fontSize="small" />
              ) : (
                <CloseTwoToneIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </HeaderWrapper>
  );
}

export default Header;
