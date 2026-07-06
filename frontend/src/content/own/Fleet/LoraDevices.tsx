import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import RouterTwoToneIcon from '@mui/icons-material/RouterTwoTone';
import { GridActionsCellItem, GridEnrichedColDef, GridRowParams } from '@mui/x-data-grid';
import { useDispatch, useSelector } from '../../../store';
import { addLoraDevice, deleteLoraDevice, editLoraDevice } from '../../../slices/vehicle';
import { LoraDevice } from '../../../models/owns/vehicle';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import ConfirmDialog from '../components/ConfirmDialog';
import CustomDataGrid from '../components/CustomDatagrid';

interface DeviceFormValues {
  deviceEUI: string;
  name: string;
  description: string;
  vehicleId: string;
  active: boolean;
}

const emptyForm: DeviceFormValues = {
  deviceEUI: '',
  name: '',
  description: '',
  vehicleId: '',
  active: true
};

function LoraDevices() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { loraDevices, vehicles } = useSelector((state) => state.vehicles);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingDevice, setEditingDevice] = useState<LoraDevice | null>(null);
  const [form, setForm] = useState<DeviceFormValues>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingDevice(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (device: LoraDevice) => {
    setEditingDevice(device);
    setForm({
      deviceEUI: device.deviceEUI ?? '',
      name: device.name ?? '',
      description: device.description ?? '',
      vehicleId: device.vehicle?.id?.toString() ?? '',
      active: device.active
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.deviceEUI) {
      showSnackBar(t('device_eui_required'), 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<LoraDevice> = {
        deviceEUI: form.deviceEUI,
        name: form.name,
        description: form.description,
        vehicle: form.vehicleId ? { id: parseInt(form.vehicleId), name: '' } : null,
        active: form.active
      };
      if (editingDevice) {
        await dispatch(editLoraDevice(editingDevice.id, payload));
        showSnackBar(t('lora_device_updated'), 'success');
      } else {
        await dispatch(addLoraDevice(payload));
        showSnackBar(t('lora_device_created'), 'success');
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
      await dispatch(deleteLoraDevice(deletingId));
      showSnackBar(t('lora_device_deleted'), 'success');
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const columns: GridEnrichedColDef[] = [
    {
      field: 'deviceEUI',
      headerName: t('device_eui'),
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <RouterTwoToneIcon fontSize="small" color="action" />
          <Typography variant="body2" fontFamily="monospace">{params.value}</Typography>
        </Stack>
      )
    },
    { field: 'name', headerName: t('name'), flex: 1 },
    {
      field: 'vehicle',
      headerName: t('assigned_vehicle'),
      flex: 1,
      valueGetter: (params) => params.row.vehicle?.name ?? '—'
    },
    {
      field: 'active',
      headerName: t('status'),
      width: 120,
      renderCell: (params) => (
        <Chip
          size="small"
          label={params.value ? t('active') : t('inactive')}
          color={params.value ? 'success' : 'default'}
        />
      )
    },
    {
      field: 'lastSeen',
      headerName: t('last_seen'),
      flex: 1,
      valueFormatter: (p) =>
        p.value ? new Date(p.value).toLocaleString() : t('never')
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      getActions: (params: GridRowParams<LoraDevice>) => [
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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">{t('lora_devices')}</Typography>
        <Button variant="contained" startIcon={<AddTwoToneIcon />} onClick={openAdd}>
          {t('add_lora_device')}
        </Button>
      </Box>

      <Box mb={2} p={2} sx={{ bgcolor: 'info.lighter', borderRadius: 1, border: '1px solid', borderColor: 'info.light' }}>
        <Typography variant="subtitle2" gutterBottom>{t('lora_webhook_info_title')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('lora_webhook_info_body')}
        </Typography>
        <Typography variant="body2" fontFamily="monospace" mt={1}>
          POST /api/fleet/lora/uplink
        </Typography>
      </Box>

      <Card>
        <CustomDataGrid
          columns={columns}
          rows={loraDevices}
          loading={false}
          components={{ Toolbar: null }}
        />
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDevice ? t('edit_lora_device') : t('add_lora_device')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={t('device_eui')}
                value={form.deviceEUI}
                onChange={(e) => setForm({ ...form, deviceEUI: e.target.value })}
                fullWidth
                required
                inputProps={{ maxLength: 16 }}
                helperText={t('device_eui_hint')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('device_name')}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('description')}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('assign_to_vehicle')}</InputLabel>
                <Select
                  value={form.vehicleId}
                  label={t('assign_to_vehicle')}
                  onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
                >
                  <MenuItem value="">{t('no_vehicle')}</MenuItem>
                  {vehicles.map((v) => (
                    <MenuItem key={v.id} value={v.id.toString()}>
                      {v.name} {v.licensePlate ? `(${v.licensePlate})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                }
                label={t('active')}
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
            {editingDevice ? t('save') : t('add')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deletingId}
        onCancel={() => setDeletingId(null)}
        onConfirm={handleDelete}
        confirmText={t('delete')}
        question={t('confirm_delete_lora_device')}
      />
    </Box>
  );
}

export default LoraDevices;
