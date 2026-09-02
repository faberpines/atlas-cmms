import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import { DataGrid, GridEnrichedColDef } from '@mui/x-data-grid';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import { useDispatch, useSelector } from '../../../store';
import {
  getLotoRecords,
  createLotoRecord,
  updateLotoRecord,
  releaseLotoRecord,
  deleteLotoRecord
} from '../../../slices/loto';
import { getAssetsMini } from '../../../slices/asset';
import { getUsersMini } from '../../../slices/user';
import { getAllBreakers } from '../../../slices/breakerPanel';
import LotoRecord, { EnergyType, LotoStatus, energyTypes } from '../../../models/owns/loto';

interface LotoFormValues {
  title: string;
  isolationPoint: string;
  isolationPointMode: 'dropdown' | 'manual';
  selectedBreakerId: string;
  energyType: EnergyType;
  status: LotoStatus;
  reason: string;
  procedure: string;
  notes: string;
  assetId: number | '';
  taggedById: number | '';
  taggedAt: Dayjs | null;
  expectedReleaseAt: Dayjs | null;
}

const emptyForm: LotoFormValues = {
  title: '',
  isolationPoint: '',
  isolationPointMode: 'dropdown',
  selectedBreakerId: '',
  energyType: 'ELECTRICAL',
  status: 'ACTIVE',
  reason: '',
  procedure: '',
  notes: '',
  assetId: '',
  taggedById: '',
  taggedAt: dayjs(),
  expectedReleaseAt: null
};

const statusConfig: Record<LotoStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active (Locked Out)', color: '#FF1943' },
  RELEASED: { label: 'Released', color: '#57CA22' },
  EXPIRED: { label: 'Expired', color: '#FFA319' }
};

function Loto() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { lotoRecords, loadingGet } = useSelector((state) => state.loto);
  const { assetsMini } = useSelector((state) => state.assets);
  const { usersMini } = useSelector((state) => state.users);
  const { breakers } = useSelector((state) => state.breakerPanels);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LotoRecord | null>(null);
  const [form, setForm] = useState<LotoFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [printRecord, setPrintRecord] = useState<LotoRecord | null>(null);

  const handlePrint = (record: LotoRecord) => {
    setPrintRecord(record);
    setTimeout(() => window.print(), 100);
  };

  useEffect(() => {
    setTitle(t('loto'));
    dispatch(getLotoRecords());
    dispatch(getAssetsMini());
    dispatch(getUsersMini());
    dispatch(getAllBreakers());
  }, []);

  const openAdd = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setOpenDialog(true);
  };

  const openEdit = (record: LotoRecord) => {
    setEditingRecord(record);
    setForm({
      title: record.title ?? '',
      isolationPoint: record.isolationPoint ?? '',
      isolationPointMode: 'manual',
      selectedBreakerId: '',
      energyType: record.energyType ?? 'ELECTRICAL',
      status: record.status ?? 'ACTIVE',
      reason: record.reason ?? '',
      procedure: record.procedure ?? '',
      notes: record.notes ?? '',
      assetId: record.asset?.id ?? '',
      taggedById: record.taggedBy?.id ?? '',
      taggedAt: record.taggedAt ? dayjs(record.taggedAt) : dayjs(),
      expectedReleaseAt: record.expectedReleaseAt ? dayjs(record.expectedReleaseAt) : null
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    // Resolve the actual isolation point text
    let resolvedIsolationPoint = form.isolationPoint;
    if (form.isolationPointMode === 'dropdown' && form.selectedBreakerId) {
      const selectedBreaker = breakers.find((b) => String(b.id) === form.selectedBreakerId);
      if (selectedBreaker) {
        resolvedIsolationPoint = selectedBreaker.label;
      }
    }

    if (!form.title.trim() || !resolvedIsolationPoint.trim()) {
      showSnackBar(t('loto_title_isolation_required'), 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        title: form.title,
        isolationPoint: resolvedIsolationPoint,
        energyType: form.energyType,
        status: form.status,
        reason: form.reason || null,
        procedure: form.procedure || null,
        notes: form.notes || null,
        taggedAt: form.taggedAt ? form.taggedAt.toISOString() : new Date().toISOString(),
        expectedReleaseAt: form.expectedReleaseAt ? form.expectedReleaseAt.toISOString() : null
      };
      if (form.assetId !== '') payload.asset = { id: form.assetId };
      if (form.taggedById !== '') payload.taggedBy = { id: form.taggedById };

      if (editingRecord) {
        await dispatch(updateLotoRecord(editingRecord.id, payload));
        showSnackBar(t('loto_updated'), 'success');
      } else {
        await dispatch(createLotoRecord(payload));
        showSnackBar(t('loto_created'), 'success');
      }
      setOpenDialog(false);
    } catch (e) {
      showSnackBar(t('something_went_wrong'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRelease = async (id: number) => {
    await dispatch(releaseLotoRecord(id));
    showSnackBar(t('loto_released'), 'success');
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteLotoRecord(id));
    setConfirmDeleteId(null);
    showSnackBar(t('deleted_successfully'), 'success');
  };

  const columns: GridEnrichedColDef[] = [
    {
      field: 'title',
      headerName: t('loto_title'),
      flex: 1,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1}>
          <LockTwoToneIcon
            fontSize="small"
            sx={{ color: params.row.status === 'ACTIVE' ? 'error.main' : 'success.main' }}
          />
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Stack>
      )
    },
    {
      field: 'isolationPoint',
      headerName: t('isolation_point'),
      flex: 1
    },
    {
      field: 'energyType',
      headerName: t('energy_type'),
      width: 130,
      renderCell: (params) => (
        <Chip
          label={t(params.value?.toLowerCase())}
          size="small"
          variant="outlined"
          color="default"
        />
      )
    },
    {
      field: 'asset',
      headerName: t('asset'),
      flex: 1,
      valueGetter: (params) => params.row.asset?.name ?? '—'
    },
    {
      field: 'taggedBy',
      headerName: t('tagged_by'),
      flex: 1,
      valueGetter: (params) =>
        params.row.taggedBy
          ? `${params.row.taggedBy.firstName} ${params.row.taggedBy.lastName}`
          : '—'
    },
    {
      field: 'reason',
      headerName: t('reason'),
      flex: 1,
      valueFormatter: (p) => p.value || '—'
    },
    {
      field: 'taggedAt',
      headerName: t('tagged_at'),
      width: 160,
      valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString() : '—')
    },
    {
      field: 'expectedReleaseAt',
      headerName: t('expected_release'),
      width: 160,
      valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleString() : '—')
    },
    {
      field: 'status',
      headerName: t('status'),
      width: 160,
      renderCell: (params) => {
        const cfg = statusConfig[params.value as LotoStatus];
        return (
          <Chip
            label={cfg?.label ?? params.value}
            size="small"
            sx={{ backgroundColor: cfg?.color ?? 'grey.500', color: '#fff', fontWeight: 600 }}
          />
        );
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      width: 170,
      getActions: (params) => [
        <Tooltip title={t('print')} key="print">
          <IconButton size="small" onClick={() => handlePrint(params.row as LotoRecord)}>
            <PrintTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
        ...(params.row.status === 'ACTIVE'
          ? [
              <Tooltip title={t('release_lockout')} key="release">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => handleRelease(params.row.id)}
                >
                  <LockOpenTwoToneIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ]
          : []),
        <Tooltip title={t('edit')} key="edit">
          <IconButton size="small" onClick={() => openEdit(params.row as LotoRecord)}>
            <EditTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip title={t('delete')} key="delete">
          <IconButton
            size="small"
            color="error"
            onClick={() => setConfirmDeleteId(params.row.id)}
          >
            <DeleteTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ]
    }
  ];

  const activeCount = lotoRecords.filter((r) => r.status === 'ACTIVE').length;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={2}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <LockTwoToneIcon color={activeCount > 0 ? 'error' : 'disabled'} />
            <Box>
              <Typography variant="h5">{t('loto')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('loto_subtitle')}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {activeCount > 0 && (
              <Chip
                label={`${activeCount} ${t('active_lockouts')}`}
                color="error"
                size="small"
                icon={<LockTwoToneIcon />}
              />
            )}
            <Button
              variant="contained"
              startIcon={<AddTwoToneIcon />}
              onClick={openAdd}
            >
              {t('add_lockout')}
            </Button>
          </Stack>
        </Stack>

        {/* OSHA info banner */}
        <Box
          mb={2}
          p={1.5}
          sx={{
            bgcolor: 'warning.light',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'warning.main'
          }}
        >
          <Typography variant="caption" color="warning.dark">
            ⚠️ {t('loto_osha_note')}
          </Typography>
        </Box>

        {/* DataGrid */}
        <DataGrid
          rows={lotoRecords}
          columns={columns}
          loading={loadingGet}
          autoHeight
          disableSelectionOnClick
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50]}
          sx={{ bgcolor: 'background.paper' }}
        />

        {/* Add / Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingRecord ? t('edit_lockout') : t('add_lockout')}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2} mt={0}>
              {/* Title */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label={t('loto_title')}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  fullWidth
                  required
                  placeholder={t('loto_title_placeholder')}
                />
              </Grid>

              {/* Energy Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('energy_type')}</InputLabel>
                  <Select
                    value={form.energyType}
                    label={t('energy_type')}
                    onChange={(e) =>
                      setForm({ ...form, energyType: e.target.value as EnergyType })
                    }
                  >
                    {energyTypes.map((et) => (
                      <MenuItem key={et} value={et}>
                        {t(et.toLowerCase())}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Isolation Point - dropdown or manual */}
              <Grid item xs={12}>
                {/* Group breakers by panel for the dropdown */}
                {(() => {
                  // Build grouped structure
                  const panelMap: Record<string, { panelName: string; items: typeof breakers }> = {};
                  breakers.forEach((b) => {
                    const key = String(b.panel?.id ?? 'unknown');
                    if (!panelMap[key]) {
                      panelMap[key] = { panelName: b.panel?.name ?? t('unknown_panel'), items: [] };
                    }
                    panelMap[key].items.push(b);
                  });
                  const hasBreakers = breakers.length > 0;

                  return (
                    <Stack spacing={1}>
                      {hasBreakers && form.isolationPointMode === 'dropdown' && (
                        <FormControl fullWidth required>
                          <InputLabel>{t('select_breaker')}</InputLabel>
                          <Select
                            value={form.selectedBreakerId}
                            label={t('select_breaker')}
                            onChange={(e) =>
                              setForm({ ...form, selectedBreakerId: e.target.value })
                            }
                          >
                            {Object.entries(panelMap).map(([key, group]) => [
                              <ListSubheader key={`header-${key}`}>
                                🔌 {group.panelName}
                              </ListSubheader>,
                              ...group.items.map((b) => (
                                <MenuItem key={b.id} value={String(b.id)} sx={{ pl: 3 }}>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography variant="body2">{b.label}</Typography>
                                    {b.amperage && (
                                      <Chip
                                        label={`${b.amperage}A`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 18, fontSize: 10 }}
                                      />
                                    )}
                                  </Stack>
                                </MenuItem>
                              ))
                            ])}
                            <Divider />
                            <MenuItem value="" onClick={() => setForm({ ...form, isolationPointMode: 'manual', selectedBreakerId: '' })}>
                              ✏️ {t('enter_manually')}
                            </MenuItem>
                          </Select>
                        </FormControl>
                      )}
                      {(!hasBreakers || form.isolationPointMode === 'manual') && (
                        <TextField
                          label={t('isolation_point')}
                          value={form.isolationPoint}
                          onChange={(e) => setForm({ ...form, isolationPoint: e.target.value })}
                          fullWidth
                          required
                          placeholder={t('isolation_point_placeholder')}
                          helperText={t('isolation_point_hint')}
                        />
                      )}
                      {hasBreakers && (
                        <Button
                          size="small"
                          variant="text"
                          sx={{ alignSelf: 'flex-start' }}
                          onClick={() =>
                            setForm({
                              ...form,
                              isolationPointMode:
                                form.isolationPointMode === 'dropdown' ? 'manual' : 'dropdown',
                              isolationPoint: '',
                              selectedBreakerId: ''
                            })
                          }
                        >
                          {form.isolationPointMode === 'dropdown'
                            ? `✏️ ${t('enter_manually_instead')}`
                            : `📋 ${t('select_from_breakers')}`}
                        </Button>
                      )}
                    </Stack>
                  );
                })()}
              </Grid>

              {/* Asset dropdown */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('asset')} ({t('optional')})</InputLabel>
                  <Select
                    value={form.assetId}
                    label={`${t('asset')} (${t('optional')})`}
                    onChange={(e) => setForm({ ...form, assetId: e.target.value as number | '' })}
                  >
                    <MenuItem value="">{t('none')}</MenuItem>
                    {assetsMini.map((a) => (
                      <MenuItem key={a.id} value={a.id}>
                        {a.name}
                        {a.customId ? ` (${a.customId})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tagged By */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('tagged_by')}</InputLabel>
                  <Select
                    value={form.taggedById}
                    label={t('tagged_by')}
                    onChange={(e) =>
                      setForm({ ...form, taggedById: e.target.value as number | '' })
                    }
                  >
                    <MenuItem value="">{t('none')}</MenuItem>
                    {usersMini.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Tagged At */}
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label={t('tagged_at')}
                  value={form.taggedAt}
                  onChange={(val) => setForm({ ...form, taggedAt: val })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              {/* Expected Release */}
              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label={t('expected_release')}
                  value={form.expectedReleaseAt}
                  onChange={(val) => setForm({ ...form, expectedReleaseAt: val })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>

              {/* Status (edit only) */}
              {editingRecord && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t('status')}</InputLabel>
                    <Select
                      value={form.status}
                      label={t('status')}
                      onChange={(e) =>
                        setForm({ ...form, status: e.target.value as LotoStatus })
                      }
                    >
                      <MenuItem value="ACTIVE">{t('active')}</MenuItem>
                      <MenuItem value="RELEASED">{t('released')}</MenuItem>
                      <MenuItem value="EXPIRED">{t('expired')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12}>
                <Divider>{t('reason_and_procedure')}</Divider>
              </Grid>

              {/* Reason */}
              <Grid item xs={12}>
                <TextField
                  label={t('reason')}
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                  placeholder={t('loto_reason_placeholder')}
                />
              </Grid>

              {/* Procedure */}
              <Grid item xs={12}>
                <TextField
                  label={t('loto_procedure')}
                  value={form.procedure}
                  onChange={(e) => setForm({ ...form, procedure: e.target.value })}
                  fullWidth
                  multiline
                  rows={4}
                  placeholder={t('loto_procedure_placeholder')}
                />
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  label={t('notes')}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>{t('cancel')}</Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Confirm Delete Dialog */}
        <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
          <DialogTitle>{t('confirm_delete')}</DialogTitle>
          <DialogContent>
            <Typography>{t('loto_delete_confirm')}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
            >
              {t('delete')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Hidden print-only layout */}
        <div id="loto-print-view" style={{ display: 'none' }}>
          {printRecord && <LotoPrintView record={printRecord} />}
        </div>
      </Box>
    </LocalizationProvider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Print-only LOTO permit layout                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
function LotoPrintView({ record }: { record: LotoRecord }) {
  const statusColors: Record<LotoStatus, string> = {
    ACTIVE: '#c0392b',
    RELEASED: '#27ae60',
    EXPIRED: '#e67e22'
  };
  const statusLabels: Record<LotoStatus, string> = {
    ACTIVE: 'ACTIVE — LOCKED OUT',
    RELEASED: 'RELEASED',
    EXPIRED: 'EXPIRED'
  };

  const s: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '11pt',
    color: '#000',
    padding: '24px',
    maxWidth: '800px',
    margin: '0 auto'
  };
  const label: React.CSSProperties = { fontSize: '8pt', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 };
  const val: React.CSSProperties = { fontSize: '11pt', marginBottom: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
  const sectionTitle: React.CSSProperties = { fontSize: '11pt', fontWeight: 'bold', borderBottom: '1px solid #999', paddingBottom: 4, marginTop: 18, marginBottom: 10 };
  const twoCol: React.CSSProperties = { display: 'flex', gap: 32, flexWrap: 'wrap' };
  const col: React.CSSProperties = { flex: '1 1 220px' };

  const F = ({ lbl, v }: { lbl: string; v?: string | null }) => (
    <div style={col}>
      <div style={label}>{lbl}</div>
      <div style={val}>{v || '—'}</div>
    </div>
  );

  const fmt = (d?: string | null) =>
    d ? dayjs(d).format('MM/DD/YYYY h:mm A') : '—';

  return (
    <div style={s}>
      {/* Permit Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: '18pt', fontWeight: 'bold', letterSpacing: '1px' }}>
            🔒 LOCKOUT / TAGOUT PERMIT
          </div>
          <div style={{ fontSize: '9pt', color: '#444', marginTop: 2 }}>
            Bay Baby Produce — OSHA 29 CFR 1910.147 Energy Control Program
          </div>
        </div>
        <div style={{
          border: `3px solid ${statusColors[record.status]}`,
          borderRadius: 6,
          padding: '6px 16px',
          textAlign: 'center',
          minWidth: 130
        }}>
          <div style={{ fontSize: '9pt', color: '#555' }}>STATUS</div>
          <div style={{ fontSize: '12pt', fontWeight: 'bold', color: statusColors[record.status] }}>
            {statusLabels[record.status]}
          </div>
        </div>
      </div>

      {/* Permit ID + Printed */}
      <div style={{ fontSize: '9pt', color: '#666', marginBottom: 16 }}>
        Permit #{record.id} &nbsp;|&nbsp; Printed: {dayjs().format('MM/DD/YYYY h:mm A')}
      </div>

      {/* Section 1 — Identity */}
      <div style={sectionTitle}>1. Identification</div>
      <div style={twoCol}>
        <F lbl="Lockout Title" v={record.title} />
        <F lbl="Energy Type" v={record.energyType} />
      </div>
      <div style={twoCol}>
        <F lbl="Isolation Point" v={record.isolationPoint} />
        <F lbl="Associated Asset / Equipment" v={record.asset?.name ?? null} />
      </div>

      {/* Section 2 — Personnel & Timing */}
      <div style={sectionTitle}>2. Personnel &amp; Timing</div>
      <div style={twoCol}>
        <F lbl="Tagged By" v={record.taggedBy ? `${record.taggedBy.firstName} ${record.taggedBy.lastName}` : null} />
        <F lbl="Tagged At" v={fmt(record.taggedAt)} />
      </div>
      <div style={twoCol}>
        <F lbl="Expected Release" v={fmt(record.expectedReleaseAt)} />
        {record.status === 'RELEASED' && (
          <>
            <F lbl="Released By" v={record.releasedBy ? `${record.releasedBy.firstName} ${record.releasedBy.lastName}` : null} />
            <F lbl="Released At" v={fmt(record.releasedAt)} />
          </>
        )}
      </div>

      {/* Section 3 — Reason */}
      <div style={sectionTitle}>3. Reason for Lockout</div>
      <div style={val}>{record.reason || '—'}</div>

      {/* Section 4 — Procedure */}
      <div style={sectionTitle}>4. Isolation Procedure (Steps)</div>
      <div style={{ ...val, border: '1px solid #ccc', borderRadius: 4, padding: '8px 12px', background: '#fafafa', minHeight: 80 }}>
        {record.procedure || '—'}
      </div>

      {/* Section 5 — Notes */}
      {record.notes && (
        <>
          <div style={sectionTitle}>5. Notes</div>
          <div style={val}>{record.notes}</div>
        </>
      )}

      {/* Signature block */}
      <div style={{ marginTop: 40, borderTop: '2px solid #000', paddingTop: 16 }}>
        <div style={{ ...sectionTitle, borderBottom: 'none', marginTop: 0 }}>Signatures</div>
        <div style={twoCol}>
          <div style={col}>
            <div style={{ borderBottom: '1px solid #000', height: 36 }} />
            <div style={{ ...label, marginTop: 4 }}>Authorized Employee (Lockout) — Signature</div>
          </div>
          <div style={col}>
            <div style={{ borderBottom: '1px solid #000', height: 36 }} />
            <div style={{ ...label, marginTop: 4 }}>Date</div>
          </div>
        </div>
        <div style={{ ...twoCol, marginTop: 20 }}>
          <div style={col}>
            <div style={{ borderBottom: '1px solid #000', height: 36 }} />
            <div style={{ ...label, marginTop: 4 }}>Authorized Employee (Release) — Signature</div>
          </div>
          <div style={col}>
            <div style={{ borderBottom: '1px solid #000', height: 36 }} />
            <div style={{ ...label, marginTop: 4 }}>Date</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, fontSize: '8pt', color: '#777', borderTop: '1px solid #ddd', paddingTop: 8 }}>
        ⚠️ This permit must remain at the work site for the duration of the lockout. Keep a copy on file for OSHA compliance.
      </div>
    </div>
  );
}

export default Loto;
