import { ChangeEvent, ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Box, Button, Card, Stack, styled, Tab, Tabs, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';

const TabsContainerWrapper = styled(Box)(
  ({ theme }) => `
      min-width: 0;
      flex: 1 1 auto;

      .MuiTabs-root {
        height: 44px;
        min-height: 44px;
      }

      .MuiTabs-scrollableX {
        overflow-x: auto !important;
      }

      .MuiTabs-indicator {
          min-height: 4px;
          height: 4px;
          box-shadow: none;
          bottom: 0;
          background: none;
          border: 0;

          &:after {
            position: absolute;
            left: 50%;
            width: 28px;
            content: ' ';
            margin-left: -14px;
            background: ${theme.colors.primary.main};
            border-radius: inherit;
            height: 100%;
          }
      }

      .MuiTab-root {
          &.MuiButtonBase-root {
              height: 44px;
              min-height: 44px;
              background: transparent;
              border: 0;
              position: relative;
              margin-right: ${theme.spacing(1)};
              font-size: ${theme.typography.pxToRem(14)};
              color: ${theme.colors.alpha.black[80]};
              border-bottom-left-radius: 0;
              border-bottom-right-radius: 0;

              .MuiTouchRipple-root {
                opacity: .1;
              }

              &:hover {
                color: ${theme.colors.alpha.black[100]};
              }
          }

          &.Mui-selected {
              color: ${theme.colors.alpha.black[100]};
              font-weight: 700;
          }
      }
  `
);

interface SettingsLayoutProps {
  children?: ReactNode;
  tabs: { value: string; label: string }[];
  basePath: string;
  title: string;
  tabIndex: number;
  action?: () => void;
  secondAction?: () => void;
  actionTitle?: string;
  secondActionTitle?: string;
  secondActionIcon?: ReactNode;
  editAction?: boolean;
  withoutCard?: boolean;
}

function MultipleTabsLayout(props: SettingsLayoutProps) {
  const {
    children,
    tabIndex,
    title,
    tabs,
    basePath,
    action,
    actionTitle,
    withoutCard,
    editAction,
    secondAction,
    secondActionTitle,
    secondActionIcon
  } = props;
  const { t }: { t: any } = useTranslation();
  const navigate = useNavigate();
  const currentTab = tabs[tabIndex].value;

  const handleTabsChange = (_event: ChangeEvent<{}>, value: string): void => {
    navigate(`${basePath}/${value}`);
  };

  return (
    <Box sx={{ pt: { xs: 1.5, md: 2.5 }, pb: 4 }}>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Box
        sx={{
          mx: { xs: 1.5, sm: 3, md: 4 },
          mb: 2,
          px: { xs: 2, md: 3 },
          py: 2,
          borderRadius: 2,
          color: 'common.white',
          bgcolor: '#143923',
          borderLeft: '5px solid #e27039',
          boxShadow: '0 14px 32px rgba(20, 57, 35, 0.16)'
        }}
      >
        <Typography
          component="h1"
          sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: 25, md: 30 }, fontWeight: 600 }}
        >
          {title}
        </Typography>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        gap={2}
        sx={{
          px: { xs: 1.5, sm: 3, md: 4 },
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}
      >
        <TabsContainerWrapper>
          <Tabs
            onChange={handleTabsChange}
            value={currentTab}
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
          >
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </TabsContainerWrapper>
        <Stack
          direction="row"
          spacing={1}
          sx={{ my: 1, flexShrink: 0, flexWrap: 'wrap' }}
        >
          {action && (
            <Button
              startIcon={editAction ? <EditTwoToneIcon /> : <AddTwoToneIcon />}
              variant="contained"
              onClick={action}
            >
              {actionTitle}
            </Button>
          )}
          {secondAction && secondActionTitle && (
            <Button
              startIcon={secondActionIcon}
              variant="outlined"
              onClick={secondAction}
            >
              {secondActionTitle}
            </Button>
          )}
        </Stack>
      </Box>
      {withoutCard ? (
        children
      ) : (
        <Card
          variant="outlined"
          sx={{
            mx: { xs: 1.5, sm: 3, md: 4 },
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {children}
        </Card>
      )}
    </Box>
  );
}

export default MultipleTabsLayout;
