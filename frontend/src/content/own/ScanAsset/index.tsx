import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import QrCodeScannerTwoToneIcon from '@mui/icons-material/QrCodeScannerTwoTone';
import CameraAltTwoToneIcon from '@mui/icons-material/CameraAltTwoTone';
import StopCircleTwoToneIcon from '@mui/icons-material/StopCircleTwoTone';
import BuildTwoToneIcon from '@mui/icons-material/BuildTwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import LocationOnTwoToneIcon from '@mui/icons-material/LocationOnTwoTone';
import CategoryTwoToneIcon from '@mui/icons-material/CategoryTwoTone';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import dayjs from 'dayjs';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useDispatch } from '../../../store';
import { addWorkOrder } from '../../../slices/workOrder';
import api from '../../../utils/api';
import { AssetDTO, assetStatuses } from '../../../models/owns/asset';
import Vehicle, { VehicleUsageLog } from '../../../models/owns/vehicle';
import { useTranslation } from 'react-i18next';
import useAuth from '../../../hooks/useAuth';

// ─── Helpers ────────────────────────────────────────────────────────────────

const statusColor = (status: string): string => {
  const palette: Record<string, string> = {
    OPERATIONAL: '#57CA22',
    DOWN: '#FF1943',
    MODERNIZATION: '#CBC3E3',
    STANDBY: '#2196F3',
    INSPECTION_SCHEDULED: '#FFA319',
    COMMISSIONING: '#9E9E9E',
    EMERGENCY_SHUTDOWN: '#B71C1C'
  };
  return palette[status] ?? '#9E9E9E';
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ScanAsset() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // scan state
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // results
  const [asset, setAsset] = useState<AssetDTO | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  // WO dialog
  const [woOpen, setWoOpen] = useState(false);
  const [woForm, setWoForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });
  const [woSaving, setWoSaving] = useState(false);

  // Usage dialog
  const [usageOpen, setUsageOpen] = useState(false);
  const [usageForm, setUsageForm] = useState({ weekOf: dayjs().startOf('week').format('YYYY-MM-DD'), value: '', notes: '' });
  const [usageLogs, setUsageLogs] = useState<VehicleUsageLog[]>([]);
  const [usageLogsLoading, setUsageLogsLoading] = useState(false);
  const [usageSaving, setUsageSaving] = useState(false);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivId = 'html5qr-scan-region';

  // ── Start / stop camera ──
  useEffect(() => {
    if (cameraActive) {
      scannerRef.current = new Html5QrcodeScanner(
        scannerDivId,
        {
          fps: 10,
          qrbox: { width: 280, height: 180 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
        },
        false
      );
      scannerRef.current.render(
        (decoded) => {
          stopCamera();
          handleLookup(decoded);
        },
        () => {}
      );
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [cameraActive]);

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setCameraActive(false);
  };

  // ── Look up asset by barcode ──
  const handleLookup = async (code?: string) => {
    const barcode = (code ?? barcodeInput).trim();
    if (!barcode) return;
    setLoading(true);
    setError('');
    setAsset(null);
    setVehicle(null);

    try {
      const found = await api.get<AssetDTO>(`assets/barcode?data=${encodeURIComponent(barcode)}`);
      setAsset(found);
      // Check if a fleet vehicle matches this asset by name
      try {
        const vehicles = await api.get<Vehicle[]>('fleet/vehicles');
        const match = vehicles.find(
          (v) =>
            v.name.toLowerCase() === found.name.toLowerCase() ||
            v.assetNumber === barcode
        );
        setVehicle(match ?? null);
      } catch {
        // fleet not accessible — ignore
      }
    } catch (e: any) {
      if (e?.response?.status === 404 || (typeof e === 'string' && e.includes('Not found'))) {
        setError(t('scan_no_asset_found'));
      } else {
        setError(t('scan_lookup_error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Open WO dialog ──
  const openWO = () => {
    if (!asset) return;
    setWoForm({
      title: `${asset.name} – Work Order`,
      description: `Work order for asset: ${asset.name}${asset.serialNumber ? ` (S/N: ${asset.serialNumber})` : ''}`,
      priority: 'MEDIUM',
      dueDate: ''
    });
    setWoOpen(true);
  };

  const handleCreateWO = async () => {
    if (!woForm.title) return;
    setWoSaving(true);
    try {
      await dispatch(
        addWorkOrder({
          title: woForm.title,
          description: woForm.description,
          priority: woForm.priority,
          dueDate: woForm.dueDate || null,
          asset: asset ? { id: asset.id } : undefined
        })
      );
      setWoOpen(false);
    } catch {
      // error handled by redux
    } finally {
      setWoSaving(false);
    }
  };

  // ── Open Usage dialog ──
  const openUsage = async () => {
    if (!vehicle) return;
    setUsageForm({
      weekOf: dayjs().startOf('week').format('YYYY-MM-DD'),
      value: '',
      notes: ''
    });
    setUsageOpen(true);
    setUsageLogsLoading(true);
    try {
      const logs = await api.get<VehicleUsageLog[]>(`fleet/vehicles/${vehicle.id}/usage-logs`);
      setUsageLogs(logs || []);
    } catch {
      setUsageLogs([]);
    } finally {
      setUsageLogsLoading(false);
    }
  };

  const handleSaveUsage = async () => {
    if (!vehicle || !usageForm.value) return;
    setUsageSaving(true);
    try {
      const newLog = await api.post<VehicleUsageLog>(`fleet/vehicles/${vehicle.id}/usage-logs`, {
        weekOf: usageForm.weekOf,
        unitType: vehicle.usageUnit || 'HOURS',
        value: parseFloat(usageForm.value),
        notes: usageForm.notes
      });
      setUsageLogs((prev) => [newLog, ...prev]);
      setUsageForm({ weekOf: dayjs().startOf('week').format('YYYY-MM-DD'), value: '', notes: '' });
    } catch {
      // silent
    } finally {
      setUsageSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* ── Header ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <QrCodeScannerTwoToneIcon sx={{ fontSize: 36, color: 'primary.main' }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>{t('scan_asset')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('scan_asset_subtitle')}
          </Typography>
        </Box>
      </Stack>

      {/* ── Scan Input ── */}
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>{t('scan_enter_barcode')}</Typography>

          <Stack direction="row" spacing={1} mb={2}>
            <TextField
              fullWidth
              autoFocus
              label={t('scan_barcode_label')}
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(); }}
              placeholder={t('scan_barcode_placeholder')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <QrCodeScannerTwoToneIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            <Tooltip title={t('scan_search')}>
              <span>
                <Button
                  variant="contained"
                  sx={{ minWidth: 56, height: 56 }}
                  onClick={() => handleLookup()}
                  disabled={loading || !barcodeInput.trim()}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : <SearchTwoToneIcon />}
                </Button>
              </span>
            </Tooltip>
          </Stack>

          <Divider sx={{ my: 1.5 }}>
            <Typography variant="caption" color="text.secondary">{t('or')}</Typography>
          </Divider>

          {!cameraActive ? (
            <Button
              variant="outlined"
              startIcon={<CameraAltTwoToneIcon />}
              fullWidth
              onClick={() => setCameraActive(true)}
            >
              {t('scan_use_camera')}
            </Button>
          ) : (
            <Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<StopCircleTwoToneIcon />}
                fullWidth
                sx={{ mb: 1.5 }}
                onClick={stopCamera}
              >
                {t('scan_stop_camera')}
              </Button>
              <Box
                id={scannerDivId}
                sx={{ width: '100%', '& video': { width: '100% !important' } }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Error ── */}
      {error && <Alert severity="warning" sx={{ mb: 3 }}>{error}</Alert>}

      {/* ── Asset Result Card ── */}
      {asset && (
        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" mb={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>{asset.name}</Typography>
              </Box>
              {asset.status && (
                <Chip
                  label={asset.status.replace(/_/g, ' ')}
                  size="small"
                  sx={{ backgroundColor: statusColor(asset.status), color: '#fff', fontWeight: 600 }}
                />
              )}
            </Stack>

            <Grid container spacing={2} mb={2}>
              {asset.location && (
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnTwoToneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('location')}</Typography>
                      <Typography variant="body2">{asset.location.name}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {asset.category && (
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CategoryTwoToneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('category')}</Typography>
                      <Typography variant="body2">{asset.category.name}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {asset.model && (
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InfoTwoToneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('model')}</Typography>
                      <Typography variant="body2">{asset.model}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {asset.serialNumber && (
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <InfoTwoToneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('serial_number')}</Typography>
                      <Typography variant="body2">{asset.serialNumber}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {asset.description && (
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">{t('description')}</Typography>
                  <Typography variant="body2">{asset.description}</Typography>
                </Grid>
              )}
              {asset.openWorkOrders !== undefined && (
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BuildTwoToneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('open_work_orders')}</Typography>
                      <Typography variant="body2">{asset.openWorkOrders}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
              {vehicle && (
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SpeedTwoToneIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" color="text.secondary">{t('fleet_asset')}</Typography>
                      <Typography variant="body2">
                        {vehicle.name}{vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : ''}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ mb: 2 }} />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant="contained"
                startIcon={<BuildTwoToneIcon />}
                onClick={openWO}
              >
                {t('create_work_order')}
              </Button>
              {vehicle && (
                <Button
                  variant="outlined"
                  startIcon={<SpeedTwoToneIcon />}
                  onClick={openUsage}
                >
                  {t('log_usage')}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ── Create Work Order Dialog ── */}
      <Dialog open={woOpen} onClose={() => setWoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('create_work_order')}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} pt={1}>
            {asset && (
              <Alert severity="info" icon={false} sx={{ py: 0.5 }}>
                <Typography variant="body2">
                  <strong>{t('asset')}:</strong> {asset.name}
                </Typography>
              </Alert>
            )}
            <TextField
              label={t('title')}
              fullWidth
              required
              value={woForm.title}
              onChange={(e) => setWoForm((f) => ({ ...f, title: e.target.value }))}
            />
            <TextField
              label={t('description')}
              fullWidth
              multiline
              rows={3}
              value={woForm.description}
              onChange={(e) => setWoForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Select
              value={woForm.priority}
              onChange={(e) => setWoForm((f) => ({ ...f, priority: e.target.value }))}
            >
              {['NONE', 'LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <MenuItem key={p} value={p}>{t(p.toLowerCase())}</MenuItem>
              ))}
            </Select>
            <TextField
              label={t('due_date')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={woForm.dueDate}
              onChange={(e) => setWoForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWoOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            disabled={!woForm.title || woSaving}
            onClick={handleCreateWO}
          >
            {woSaving ? <CircularProgress size={20} /> : t('create_work_order')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Log Usage Dialog ── */}
      <Dialog open={usageOpen} onClose={() => setUsageOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {t('log_usage')} — {vehicle?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} pt={1}>
            <TextField
              label={t('week_of')}
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={usageForm.weekOf}
              onChange={(e) => setUsageForm((f) => ({ ...f, weekOf: e.target.value }))}
            />
            <TextField
              label={vehicle?.usageUnit === 'HOURS' ? t('hours') : t('miles')}
              type="number"
              fullWidth
              required
              value={usageForm.value}
              onChange={(e) => setUsageForm((f) => ({ ...f, value: e.target.value }))}
              inputProps={{ min: 0, step: 0.1 }}
            />
            <TextField
              label={t('notes')}
              fullWidth
              multiline
              rows={2}
              value={usageForm.notes}
              onChange={(e) => setUsageForm((f) => ({ ...f, notes: e.target.value }))}
            />

            {/* Recent logs */}
            <Typography variant="subtitle2" mt={1}>{t('recent_usage_logs')}</Typography>
            {usageLogsLoading ? (
              <CircularProgress size={20} />
            ) : usageLogs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">{t('no_usage_logs')}</Typography>
            ) : (
              <Box sx={{ maxHeight: 160, overflowY: 'auto' }}>
                {usageLogs.slice(0, 10).map((log) => (
                  <Stack key={log.id} direction="row" justifyContent="space-between" sx={{ py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                    <Typography variant="body2">{log.weekOf}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {log.value} {log.unitType}
                    </Typography>
                  </Stack>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUsageOpen(false)}>{t('cancel')}</Button>
          <Button
            variant="contained"
            disabled={!usageForm.value || usageSaving}
            onClick={handleSaveUsage}
          >
            {usageSaving ? <CircularProgress size={20} /> : t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
