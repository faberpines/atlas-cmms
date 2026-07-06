import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import { useDispatch, useSelector } from '../../../store';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import { Helmet } from 'react-helmet-async';
import InspectionTemplates from './InspectionTemplates';
import InspectionsList from './InspectionsList';
import { getTemplates, getInspections } from '../../../slices/inspection';
import { getAssetsMini } from '../../../slices/asset';

const tabs = [
  { value: 'inspections', label: 'Inspections' },
  { value: 'templates', label: 'Templates' }
];

export default function Inspections() {
  const { t } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [currentTab, setCurrentTab] = useState<string>('inspections');
  const { templates, inspections, loadingGet } = useSelector(
    (state) => state.inspections
  );
  const { assetsMini } = useSelector((state) => state.assets);

  useEffect(() => {
    setTitle('Inspections');
    dispatch(getTemplates());
    dispatch(getInspections());
    dispatch(getAssetsMini());
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newTab: string) => {
    setCurrentTab(newTab);
  };

  return (
    <>
      <Helmet>
        <title>Inspections</title>
      </Helmet>
      <Grid container justifyContent="center" alignItems="stretch" spacing={1} paddingX={4}>
        <Grid item xs={12}>
          <Tabs value={currentTab} onChange={handleTabChange} variant="scrollable">
            {tabs.map((tab) => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          {currentTab === 'inspections' && (
            <InspectionsList
              inspections={inspections}
              templates={templates}
              assets={assetsMini}
              loading={loadingGet}
            />
          )}
          {currentTab === 'templates' && (
            <InspectionTemplates templates={templates} loading={loadingGet} />
          )}
        </Grid>
      </Grid>
    </>
  );
}
