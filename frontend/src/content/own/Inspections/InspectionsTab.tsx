import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../../store';
import {
  getInspectionsByWorkOrder,
  getInspectionsByPM,
  getTemplates
} from '../../../slices/inspection';
import { getAssetsMini } from '../../../slices/asset';
import InspectionsList from './InspectionsList';
import { CircularProgress, Box } from '@mui/material';

interface Props {
  workOrderId?: number;
  pmId?: number;
}

export default function InspectionsTab({ workOrderId, pmId }: Props) {
  const dispatch = useDispatch();
  const { inspections, templates, loadingGet } = useSelector(
    (state) => state.inspections
  );
  const { assetsMini } = useSelector((state) => state.assets);

  useEffect(() => {
    dispatch(getTemplates());
    dispatch(getAssetsMini());
    if (workOrderId) {
      dispatch(getInspectionsByWorkOrder(workOrderId));
    } else if (pmId) {
      dispatch(getInspectionsByPM(pmId));
    }
  }, [workOrderId, pmId]);

  if (loadingGet) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <InspectionsList
      inspections={inspections}
      templates={templates}
      assets={assetsMini}
      loading={loadingGet}
      workOrderId={workOrderId}
      pmId={pmId}
    />
  );
}
