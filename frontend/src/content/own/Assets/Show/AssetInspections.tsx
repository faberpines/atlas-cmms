import { useEffect } from 'react';
import { useDispatch, useSelector } from '../../../../store';
import {
  getInspectionsByAsset,
  getTemplates
} from '../../../../slices/inspection';
import { getAssetsMini } from '../../../../slices/asset';
import InspectionsList from '../../Inspections/InspectionsList';
import { Box, CircularProgress } from '@mui/material';
import { AssetDTO } from '../../../../models/owns/asset';

interface Props {
  asset: AssetDTO;
}

export default function AssetInspections({ asset }: Props) {
  const dispatch = useDispatch();
  const { inspections, templates, loadingGet } = useSelector(
    (state) => state.inspections
  );
  const { assetsMini } = useSelector((state) => state.assets);

  useEffect(() => {
    if (asset?.id) {
      dispatch(getTemplates());
      dispatch(getAssetsMini());
      dispatch(getInspectionsByAsset(asset.id));
    }
  }, [asset?.id]);

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
    />
  );
}
