import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DirectionsCarTwoToneIcon from '@mui/icons-material/DirectionsCarTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';
import RouterTwoToneIcon from '@mui/icons-material/RouterTwoTone';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';
import { GridActionsCellItem, GridEnrichedColDef, GridRowParams } from '@mui/x-data-grid';
import { useDispatch, useSelector } from '../../../store';
import {
  addVehicle,
  deleteVehicle,
  editVehicle,
  getLoraDevices,
  getVehicles
} from '../../../slices/vehicle';
import Vehicle, {
  fuelTypes,
  FuelType,
  vehicleStatuses,
  VehicleStatus
} from '../../../models/owns/vehicle';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomDataGrid from '../components/CustomDatagrid';
import PageTitleWrapper from '../../../components/PageTitleWrapper';
import FleetMap from './FleetMap';
import LoraDevices from './LoraDevices';
import api from '../../../utils/api';

interface ImportAssetItem {
  id: number;
  name: string;
  barCode: string;
  serialNumber: string;
  model: string;
  description: string;
}

interface VehicleFormValues {
  name: string;
  assetNumber: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  trim: string;
  engineType: string;
  transmission: string;
  driveType: string;
  bodyClass: string;
  licensePlate: string;
  color: string;
  mileage: string;
  fuelType: FuelType;
  status: VehicleStatus;
  notes: string;
}

const emptyForm: VehicleFormValues = {
  name: '',
  assetNumber: '',
  vin: '',
  make: '',
  model: '',
  year: '',
  trim: '',
  engineType: '',
  transmission: '',
  driveType: '',
  bodyClass: '',
  licensePlate: '',
  color: '',
  mileage: '',
  fuelType: 'GASOLINE',
  status: 'ACTIVE',
  notes: ''
};

function Fleet() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const { vehicles, loadingGet } = useSelector((state) => state.vehicles);

  const [tabIndex, setTabIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState<VehicleFormValues>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Import from assets
  const [openImport, setOpenImport] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<number>>(new Set());
  const [importSearch, setImportSearch] = useState('');
  const [importingSaving, setImportingSaving] = useState(false);
  const [importAssets, setImportAssets] = useState<ImportAssetItem[]>([]);
  const [importAssetsLoading, setImportAssetsLoading] = useState(false);

  // existing asset numbers already in fleet
  const existingAssetNumbers = new Set(vehicles.map((v) => v.assetNumber).filter(Boolean));

  const filteredImportAssets = useMemo(() => {
    const q = importSearch.toLowerCase().trim();
    return importAssets
      .filter((a) => !existingAssetNumbers.has(a.barCode))
      .filter((a) => !q || a.name.toLowerCase().includes(q) || a.barCode.toLowerCase().includes(q));
  }, [importAssets, importSearch, vehicles]);

  const allFilteredChecked =
    filteredImportAssets.length > 0 &&
    filteredImportAssets.every((a) => selectedAssetIds.has(a.id));

  const toggleAsset = (id: number) => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredChecked) {
      setSelectedAssetIds((prev) => {
        const next = new Set(prev);
        filteredImportAssets.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedAssetIds((prev) => {
        const next = new Set(prev);
        filteredImportAssets.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const loadImportAssets = async () => {
    setImportAssetsLoading(true);
    try {
      const result = await api.post<{ content: any[] }>('assets/search', { pageNum: 0, pageSize: 500, archived: false });
      setImportAssets(
        (result.content || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          barCode: a.barCode ?? '',
          serialNumber: a.serialNumber ?? '',
          model: a.model ?? '',
          description: a.description ?? ''
        }))
      );
    } finally {
      setImportAssetsLoading(false);
    }
  };

  useEffect(() => {
    setTitle(t('fleet_management'));
    dispatch(getVehicles());
    dispatch(getLoraDevices());
  }, []);

  const openAdd = () => {
    setEditingVehicle(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      name: vehicle.name ?? '',
      assetNumber: vehicle.assetNumber ?? '',
      vin: vehicle.vin ?? '',
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      year: vehicle.year?.toString() ?? '',
      trim: vehicle.trim ?? '',
      engineType: vehicle.engineType ?? '',
      transmission: vehicle.transmission ?? '',
      driveType: vehicle.driveType ?? '',
      bodyClass: vehicle.bodyClass ?? '',
      licensePlate: vehicle.licensePlate ?? '',
      color: vehicle.color ?? '',
      mileage: vehicle.mileage?.toString() ?? '',
      fuelType: vehicle.fuelType ?? 'GASOLINE',
      status: vehicle.status ?? 'ACTIVE',
      notes: vehicle.notes ?? ''
    });
    setOpenDialog(true);
  };

  const handleVinLookup = async () => {
    const vin = form.vin.trim().toUpperCase();
    if (vin.length < 11) {
      showSnackBar(t('vin_too_short'), 'error');
      return;
    }
    setVinLoading(true);
    try {
      const data = await api.get<Record<string, string>>(`fleet/vehicles/vin/${vin}`);
      setForm((prev) => ({
        ...prev,
        make: data['Make'] ?? prev.make,
        model: data['Model'] ?? prev.model,
        year: data['Model Year'] ?? prev.year,
        trim: data['Trim'] ?? prev.trim,
        engineType: data['Engine Model'] ?? prev.engineType,
        transmission: data['Transmission Style'] ?? prev.transmission,
        driveType: data['Drive Type'] ?? prev.driveType,
        bodyClass: data['Body Class'] ?? prev.bodyClass,
        name:
          prev.name ||
          `${data['Model Year'] ?? ''} ${data['Make'] ?? ''} ${data['Model'] ?? ''}`.trim()
      }));
      showSnackBar(t('vin_decoded_successfully'), 'success');
    } catch {
      showSnackBar(t('vin_decode_failed'), 'error');
    } finally {
      setVinLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      showSnackBar(t('vehicle_name_required'), 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        mileage: form.mileage ? parseInt(form.mileage) : null
      };
      if (editingVehicle) {
        await dispatch(editVehicle(editingVehicle.id, payload));
        showSnackBar(t('vehicle_updated'), 'success');
      } else {
        await dispatch(addVehicle(payload));
        showSnackBar(t('vehicle_created'), 'success');
      }
      setOpenDialog(false);
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await dispatch(deleteVehicle(deletingId));
      showSnackBar(t('vehicle_deleted'), 'success');
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleImportAssets = async () => {
    if (selectedAssetIds.size === 0) return;
    setImportingSaving(true);
    let successCount = 0;
    try {
      for (const id of Array.from(selectedAssetIds)) {
        const asset = importAssets.find((a) => a.id === id);
        if (!asset) continue;
        const payload = {
          name: asset.name,
          assetNumber: asset.barCode || '',
          vin: asset.serialNumber || '',
          model: asset.model || '',
          notes: asset.description || '',
          status: 'ACTIVE' as VehicleStatus,
          fuelType: 'GASOLINE' as FuelType
        };
        await dispatch(addVehicle(payload));
        successCount++;
      }
      showSnackBar(`${successCount} ${t('assets_imported_to_fleet')}`, 'success');
      setOpenImport(false);
      setSelectedAssetIds(new Set());
      setImportSearch('');
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setImportingSaving(false);
    }
  };

  const statusColor = (status: VehicleStatus) => {
    const found = vehicleStatuses.find((s) => s.status === status);
    return found ? found.color({ palette: { success: { main: '#57CA22' }, warning: { main: '#FFA319' }, error: { main: '#FF1943' } } }) : 'grey';
  };

  const columns: GridEnrichedColDef[] = [
    {
      field: 'name',
      headerName: t('vehicle_name'),
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <DirectionsCarTwoToneIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={500}>{params.value}</Typography>
        </Stack>
      )
    },
    { field: 'assetNumber', headerName: t('asset_number'), flex: 1, valueFormatter: (p) => p.value || '—' },
    { field: 'vin', headerName: 'VIN', flex: 1 },
    {
      field: 'makeModel',
      headerName: t('make_model'),
      flex: 1,
      valueGetter: (params) => `${params.row.make ?? ''} ${params.row.model ?? ''}`.trim() || '—'
    },
    { field: 'year', headerName: t('year'), width: 80 },
    { field: 'licensePlate', headerName: t('license_plate'), flex: 1 },
    {
      field: 'status',
      headerName: t('status'),
      width: 160,
      renderCell: (params) => (
        <Chip
          label={t(params.value?.toLowerCase())}
          size="small"
          sx={{ backgroundColor: statusColor(params.value), color: '#fff', fontWeight: 600 }}
        />
      )
    },
    { field: 'mileage', headerName: t('vehicle_mileage'), width: 100, valueFormatter: (p) => p.value ? `${p.value.toLocaleString()} mi` : '—' },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      getActions: (params: GridRowParams<Vehicle>) => [
        <GridActionsCellItem
          key="edit"
          icon={<Tooltip title={t('edit')}><EditTwoToneIcon /></Tooltip>}
          label={t('edit')}
          onClick={() => openEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Tooltip title={t('delete')}><DeleteTwoToneIcon color="error" /></Tooltip>}
          label={t('delete')}
          onClick={() => setDeletingId(params.row.id)}
        />
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('fleet_management')}</title>
      </Helmet>
      <PageTitleWrapper>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3" component="h3">
            {t('fleet_management')}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DownloadTwoToneIcon />}
              onClick={() => { setOpenImport(true); loadImportAssets(); }}
            >
              {t('import_from_assets')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddTwoToneIcon />}
              onClick={openAdd}
            >
              {t('add_vehicle')}
            </Button>
          </Stack>
        </Box>
      </PageTitleWrapper>

      <Box sx={{ px: 3, pb: 3 }}>
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
          <Tab icon={<DirectionsCarTwoToneIcon />} iconPosition="start" label={t('vehicles')} />
          <Tab icon={<LocationOnTwoToneIcon />} iconPosition="start" label={t('fleet_map')} />
          <Tab icon={<RouterTwoToneIcon />} iconPosition="start" label={t('lora_devices')} />
        </Tabs>

        {tabIndex === 0 && (
          <Card>
            <CustomDataGrid
              columns={columns}
              rows={vehicles}
              loading={loadingGet}
              components={{ Toolbar: null }}
            />
          </Card>
        )}

        {tabIndex === 1 && <FleetMap />}

        {tabIndex === 2 && <LoraDevices />}
      </Box>

      {/* Add / Edit Vehicle Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingVehicle ? t('edit_vehicle') : t('add_vehicle')}
        </DialogTitle>
        <DialogContent dividers>
          {/* VIN Search Row */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {t('vin_search_hint')}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="VIN"
                value={form.vin}
                onChange={(e) => setForm({ ...form, vin: e.target.value.toUpperCase() })}
                inputProps={{ maxLength: 17 }}
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchTwoToneIcon />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="outlined"
                onClick={handleVinLookup}
                disabled={vinLoading || form.vin.length < 11}
                startIcon={vinLoading ? <CircularProgress size={16} /> : <SearchTwoToneIcon />}
              >
                {t('decode_vin')}
              </Button>
            </Stack>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('vehicle_name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('asset_number')}
                value={form.assetNumber}
                onChange={(e) => setForm({ ...form, assetNumber: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('vehicle_make')}
                value={form.make}
                onChange={(e) => setForm({ ...form, make: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('vehicle_model')}
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField
                label={t('vehicle_year')}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                fullWidth
                type="number"
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label={t('vehicle_trim')}
                value={form.trim}
                onChange={(e) => setForm({ ...form, trim: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('engine_type')}
                value={form.engineType}
                onChange={(e) => setForm({ ...form, engineType: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label={t('vehicle_transmission')}
                value={form.transmission}
                onChange={(e) => setForm({ ...form, transmission: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={4}>
              <TextField
                label={t('drive_type')}
                value={form.driveType}
                onChange={(e) => setForm({ ...form, driveType: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={t('body_class')}
                value={form.bodyClass}
                onChange={(e) => setForm({ ...form, bodyClass: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('license_plate')}
                value={form.licensePlate}
                onChange={(e) => setForm({ ...form, licensePlate: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('vehicle_color')}
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label={t('vehicle_mileage')}
                value={form.mileage}
                onChange={(e) => setForm({ ...form, mileage: e.target.value })}
                fullWidth
                type="number"
                InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth>
                <InputLabel>{t('fuel_type')}</InputLabel>
                <Select
                  value={form.fuelType}
                  label={t('fuel_type')}
                  onChange={(e) => setForm({ ...form, fuelType: e.target.value as FuelType })}
                >
                  {fuelTypes.map((ft) => (
                    <MenuItem key={ft} value={ft}>
                      {t(ft.toLowerCase())}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{t('status')}</InputLabel>
                <Select
                  value={form.status}
                  label={t('status')}
                  onChange={(e) => setForm({ ...form, status: e.target.value as VehicleStatus })}
                >
                  {vehicleStatuses.map((s) => (
                    <MenuItem key={s.status} value={s.status}>
                      {t(s.status.toLowerCase())}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('notes')}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {editingVehicle ? t('save') : t('add')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
        confirmText={t('delete')}
        question={t('confirm_delete_vehicle')}
      />

      {/* Import from Assets dialog */}
      <Dialog
        open={openImport}
        onClose={() => { setOpenImport(false); setSelectedAssetIds(new Set()); setImportSearch(''); }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span>{t('import_from_assets')}</span>
            {selectedAssetIds.size > 0 && (
              <Chip
                label={`${selectedAssetIds.size} ${t('selected')}`}
                color="primary"
                size="small"
              />
            )}
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Search bar */}
          <Box px={2} pt={1.5} pb={1}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('search_assets_placeholder')}
              value={importSearch}
              onChange={(e) => setImportSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchTwoToneIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Divider />
          {/* Select all row */}
          {!importAssetsLoading && filteredImportAssets.length > 0 && (
            <>
              <Box px={2} py={0.5} sx={{ bgcolor: 'action.hover' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allFilteredChecked}
                      indeterminate={
                        selectedAssetIds.size > 0 &&
                        !allFilteredChecked &&
                        filteredImportAssets.some((a) => selectedAssetIds.has(a.id))
                      }
                      onChange={toggleSelectAll}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={600}>
                      {allFilteredChecked ? t('deselect_all') : t('select_all')}
                      {' '}
                      <Typography component="span" variant="caption" color="text.secondary">
                        ({filteredImportAssets.length} {t('assets').toLowerCase()})
                      </Typography>
                    </Typography>
                  }
                />
              </Box>
              <Divider />
            </>
          )}
          {/* Asset list */}
          {importAssetsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : filteredImportAssets.length === 0 ? (
            <Box py={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {importSearch ? t('no_assets_match_search') : t('all_assets_in_fleet')}
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 400, overflowY: 'auto' }}>
              {filteredImportAssets.map((asset, idx) => (
                <React.Fragment key={asset.id}>
                  <ListItem
                    button
                    onClick={() => toggleAsset(asset.id)}
                    selected={selectedAssetIds.has(asset.id)}
                    sx={{ px: 2 }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        edge="start"
                        checked={selectedAssetIds.has(asset.id)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {asset.name}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={1} mt={0.25} flexWrap="wrap">
                          {asset.barCode && (
                            <Chip label={asset.barCode} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                          )}
                          {asset.model && (
                            <Typography variant="caption" color="text.secondary">{asset.model}</Typography>
                          )}
                          {asset.serialNumber && (
                            <Typography variant="caption" color="text.secondary">S/N: {asset.serialNumber}</Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                  {idx < filteredImportAssets.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenImport(false); setSelectedAssetIds(new Set()); setImportSearch(''); }}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            disabled={selectedAssetIds.size === 0 || importingSaving || importAssetsLoading}
            startIcon={importingSaving ? <CircularProgress size={16} /> : <DownloadTwoToneIcon />}
            onClick={handleImportAssets}
          >
            {importingSaving
              ? t('importing')
              : `${t('add_to_fleet')}${selectedAssetIds.size > 0 ? ` (${selectedAssetIds.size})` : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default Fleet;
