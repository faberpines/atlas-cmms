import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography
} from '@mui/material';
import CloseTwoToneIcon from '@mui/icons-material/CloseTwoTone';
import DirectionsCarTwoToneIcon from '@mui/icons-material/DirectionsCarTwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import BuildTwoToneIcon from '@mui/icons-material/BuildTwoTone';
import InfoTwoToneIcon from '@mui/icons-material/InfoTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Vehicle, { VehicleUsageLog, vehicleStatuses } from '../../../models/owns/vehicle';
import WorkOrder from '../../../models/owns/workOrder';
import api from '../../../utils/api';

interface Props {
  vehicle: Vehicle | null;
  onClose: () => void;
}

const statusColor = (status: string): string => {
  const palette: Record<string, string> = {
    ACTIVE: '#57CA22',
    IN_MAINTENANCE: '#FFA319',
    OUT_OF_SERVICE: '#FF1943',
    RETIRED: '#9E9E9E'
  };
  return palette[status] ?? '#9E9E9E';
};

const woStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    OPEN: '#2196F3',
    IN_PROGRESS: '#FFA319',
    ON_HOLD: '#9C27B0',
    COMPLETE: '#57CA22'
  };
  return map[status?.toUpperCase()] ?? '#9E9E9E';
};

const InfoRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Grid>
  );
};

export default function VehicleDetailDrawer({ vehicle, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  // Usage logs
  const [usageLogs, setUsageLogs] = useState<VehicleUsageLog[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);

  // Work orders
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [woLoading, setWoLoading] = useState(false);

  useEffect(() => {
    if (!vehicle) return;
    setTab(0);
    setUsageLogs([]);
    setWorkOrders([]);
  }, [vehicle?.id]);

  useEffect(() => {
    if (!vehicle || tab !== 1) return;
    setUsageLoading(true);
    api
      .get<VehicleUsageLog[]>(`fleet/vehicles/${vehicle.id}/usage-logs`)
      .then((logs) => setUsageLogs(logs || []))
      .catch(() => setUsageLogs([]))
      .finally(() => setUsageLoading(false));
  }, [vehicle?.id, tab]);

  useEffect(() => {
    if (!vehicle || tab !== 2) return;
    setWoLoading(true);
    api
      .post<any>('work-orders/search', {
        filterFields: [{ field: 'title', value: vehicle.name, operation: 'cn' }],
        pageSize: 100,
        pageNum: 0
      })
      .then((res) => {
        const list: WorkOrder[] = res?.content ?? res ?? [];
        setWorkOrders(list);
      })
      .catch(() => setWorkOrders([]))
      .finally(() => setWoLoading(false));
  }, [vehicle?.id, tab]);

  if (!vehicle) return null;

  const usageUnit = vehicle.usageUnit === 'HOURS' ? t('hours') : t('miles');
  const totalUsage = usageLogs.reduce((sum, l) => sum + (l.value ?? 0), 0);

  return (
    <Drawer
      anchor="right"
      open={!!vehicle}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* ── Header ── */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <DirectionsCarTwoToneIcon color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                {vehicle.name}
              </Typography>
              {vehicle.assetNumber && (
                <Typography variant="caption" color="text.secondary">
                  #{vehicle.assetNumber}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Chip
              label={t(vehicle.status?.toLowerCase() ?? 'active')}
              size="small"
              sx={{ backgroundColor: statusColor(vehicle.status), color: '#fff', fontWeight: 600 }}
            />
            <IconButton size="small" onClick={onClose}>
              <CloseTwoToneIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* ── Tabs ── */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tab icon={<InfoTwoToneIcon fontSize="small" />} iconPosition="start" label={t('vehicle_info')} />
        <Tab icon={<SpeedTwoToneIcon fontSize="small" />} iconPosition="start" label={t('usage_history')} />
        <Tab icon={<BuildTwoToneIcon fontSize="small" />} iconPosition="start" label={t('work_orders')} />
      </Tabs>

      {/* ── Tab content ── */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>

        {/* ── Info Tab ── */}
        {tab === 0 && (
          <Grid container spacing={2}>
            <InfoRow label={t('vehicle_name')} value={vehicle.name} />
            <InfoRow label={t('asset_number')} value={vehicle.assetNumber} />
            <InfoRow label="VIN" value={vehicle.vin} />
            <InfoRow label={t('make')} value={vehicle.make} />
            <InfoRow label={t('model')} value={vehicle.model} />
            <InfoRow label={t('year')} value={vehicle.year} />
            <InfoRow label={t('trim')} value={vehicle.trim} />
            <InfoRow label={t('engine_type')} value={vehicle.engineType} />
            <InfoRow label={t('transmission')} value={vehicle.transmission} />
            <InfoRow label={t('drive_type')} value={vehicle.driveType} />
            <InfoRow label={t('body_class')} value={vehicle.bodyClass} />
            <InfoRow label={t('license_plate')} value={vehicle.licensePlate} />
            <InfoRow label={t('color')} value={vehicle.color} />
            <InfoRow label={t('fuel_type')} value={vehicle.fuelType} />
            <InfoRow label={t('vehicle_mileage')} value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : null} />
            <InfoRow label={t('usage_unit')} value={vehicle.usageUnit} />
            {vehicle.assignedDriver && (
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">{t('assigned_driver')}</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {vehicle.assignedDriver.firstName} {vehicle.assignedDriver.lastName}
                </Typography>
              </Grid>
            )}
            {vehicle.notes && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">{t('notes')}</Typography>
                <Typography variant="body2">{vehicle.notes}</Typography>
              </Grid>
            )}
          </Grid>
        )}

        {/* ── Usage History Tab ── */}
        {tab === 1 && (
          <Box>
            {usageLoading ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress />
              </Stack>
            ) : usageLogs.length === 0 ? (
              <Typography color="text.secondary" align="center" py={4}>
                {t('no_usage_logs')}
              </Typography>
            ) : (
              <>
                <Stack direction="row" spacing={3} mb={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('total_logged')}</Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {totalUsage.toLocaleString(undefined, { maximumFractionDigits: 1 })} {usageUnit}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{t('log_entries')}</Typography>
                    <Typography variant="h6" fontWeight={700}>{usageLogs.length}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('week_of')}</TableCell>
                        <TableCell align="right">{usageUnit}</TableCell>
                        <TableCell>{t('notes')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {usageLogs.map((log) => (
                        <TableRow key={log.id} hover>
                          <TableCell>{log.weekOf}</TableCell>
                          <TableCell align="right">
                            <Typography fontWeight={600}>{log.value?.toLocaleString()}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {log.notes || '—'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}

        {/* ── Work Orders Tab ── */}
        {tab === 2 && (
          <Box>
            {woLoading ? (
              <Stack alignItems="center" py={4}>
                <CircularProgress />
              </Stack>
            ) : workOrders.length === 0 ? (
              <Typography color="text.secondary" align="center" py={4}>
                {t('no_work_orders_for_vehicle')}
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('title')}</TableCell>
                      <TableCell>{t('status')}</TableCell>
                      <TableCell>{t('priority')}</TableCell>
                      <TableCell>{t('due_date')}</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workOrders.map((wo) => (
                      <TableRow key={wo.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{wo.title}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={wo.status?.replace(/_/g, ' ') ?? '—'}
                            size="small"
                            sx={{ backgroundColor: woStatusColor(wo.status), color: '#fff', fontWeight: 600, fontSize: 11 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {wo.priority ?? '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {wo.dueDate ? new Date(wo.dueDate).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={t('open')}>
                            <IconButton size="small" onClick={() => { onClose(); navigate(`/app/work-orders/${wo.id}`); }}>
                              <OpenInNewTwoToneIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
