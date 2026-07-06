import React, { useContext, useEffect, useRef, useState } from 'react';
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
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import WaterTwoToneIcon from '@mui/icons-material/WaterTwoTone';
import { DataGrid, GridEnrichedColDef } from '@mui/x-data-grid';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import { useDispatch, useSelector } from '../../../store';
import {
  getReadings,
  getWeeklyReadings,
  createReading,
  updateReading,
  deleteReading
} from '../../../slices/washTank';
import { getUsersMini } from '../../../slices/user';
import { WashTankReading, WashTankShift, shiftLabels, shifts } from '../../../models/owns/washTank';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

interface ReadingForm {
  tankNumber: 1 | 2;
  readingDate: string;
  shift: WashTankShift;
  turbidityPass: 'PASS' | 'FAIL' | '';
  chemicalPpm: string;
  toteLevelGallons: string;
  notes: string;
  recordedById: number | '';
}

const emptyForm = (tank: 1 | 2): ReadingForm => ({
  tankNumber: tank,
  readingDate: dayjs().format('YYYY-MM-DD'),
  shift: 'SHIFT_1',
  turbidityPass: '',
  chemicalPpm: '',
  toteLevelGallons: '',
  notes: '',
  recordedById: ''
});

// Quality thresholds for color coding
const PPM_LOW = 50;          // below this is alert
const PPM_HIGH = 200;        // above this is alert

function getValueColor(value: number, low: number, high: number): string {
  if (value < low || value > high) return '#FF1943';
  if (value < low * 1.2 || value > high * 0.9) return '#FFA319';
  return '#57CA22';
}

function WashTank() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { readings, weeklyReadings, loadingGet } = useSelector((state) => state.washTank);
  const { usersMini } = useSelector((state) => state.users);

  const [activeTab, setActiveTab] = useState<0 | 1>(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WashTankReading | null>(null);
  const [form, setForm] = useState<ReadingForm>(emptyForm(1));
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Weekly report state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportWeekStart, setReportWeekStart] = useState(
    dayjs().startOf('isoWeek').format('YYYY-MM-DD')
  );
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(t('wash_tanks'));
    dispatch(getReadings());
    dispatch(getUsersMini());
  }, []);

  const currentTank = (activeTab + 1) as 1 | 2;
  const tankReadings = readings.filter((r) => r.tankNumber === currentTank);

  const openAdd = () => {
    setEditingRecord(null);
    setForm(emptyForm(currentTank));
    setOpenDialog(true);
  };

  const openEdit = (record: WashTankReading) => {
    setEditingRecord(record);
    setForm({
      tankNumber: record.tankNumber,
      readingDate: record.readingDate,
      shift: record.shift,
      turbidityPass:
        record.turbidityPass === true ? 'PASS' :
        record.turbidityPass === false ? 'FAIL' : '',
      chemicalPpm: record.chemicalPpm != null ? String(record.chemicalPpm) : '',
      toteLevelGallons: record.toteLevelGallons != null ? String(record.toteLevelGallons) : '',
      notes: record.notes ?? '',
      recordedById: record.recordedBy?.id ?? ''
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.readingDate || !form.shift) {
      showSnackBar(t('wash_tank_date_shift_required'), 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: any = {
        tankNumber: form.tankNumber,
        readingDate: form.readingDate,
        shift: form.shift,
        turbidityPass: form.turbidityPass === 'PASS' ? true : form.turbidityPass === 'FAIL' ? false : null,
        chemicalPpm: form.chemicalPpm ? parseFloat(form.chemicalPpm) : null,
        toteLevelGallons: form.toteLevelGallons ? parseFloat(form.toteLevelGallons) : null,
        notes: form.notes || null
      };
      if (form.recordedById !== '') payload.recordedBy = { id: form.recordedById };

      if (editingRecord) {
        await dispatch(updateReading(editingRecord.id, payload));
        showSnackBar(t('reading_updated'), 'success');
      } else {
        await dispatch(createReading(payload));
        showSnackBar(t('reading_saved'), 'success');
      }
      setOpenDialog(false);
    } catch {
      showSnackBar(t('something_went_wrong'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteReading(id));
    setConfirmDeleteId(null);
    showSnackBar(t('deleted_successfully'), 'success');
  };

  const handleOpenReport = async () => {
    const weekStart = dayjs(reportWeekStart).startOf('isoWeek');
    const weekEnd = weekStart.add(6, 'day');
    await dispatch(getWeeklyReadings(weekStart.format('YYYY-MM-DD'), weekEnd.format('YYYY-MM-DD')));
    setReportOpen(true);
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html><head><title>${t('weekly_wash_tank_report')}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #000; }
        h1 { font-size: 16px; margin-bottom: 4px; }
        h2 { font-size: 14px; margin: 12px 0 4px; border-bottom: 2px solid #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th { background: #333; color: #fff; padding: 6px 8px; text-align: left; font-size: 11px; }
        td { padding: 5px 8px; border-bottom: 1px solid #ccc; }
        tr:nth-child(even) { background: #f5f5f5; }
        .header { display: flex; justify-content: space-between; margin-bottom: 12px; border-bottom: 2px solid #000; padding-bottom: 8px; }
        .warn { color: #c97a00; font-weight: bold; }
        .alert { color: #cc0000; font-weight: bold; }
        .ok { color: #1a7a1a; }
        .footer { margin-top: 20px; font-size: 10px; color: #666; border-top: 1px solid #ccc; padding-top: 8px; }
        @media print { body { margin: 10px; } }
      </style></head><body>`);
    win.document.write(printContent.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const columns: GridEnrichedColDef[] = [
    {
      field: 'readingDate',
      headerName: t('date'),
      width: 110,
      valueFormatter: (p) => p.value ? dayjs(p.value).format('MM/DD/YYYY') : '—'
    },
    {
      field: 'shift',
      headerName: t('reading_shift'),
      width: 180,
      renderCell: (p) => (
        <Typography variant="caption">{shiftLabels[p.value as WashTankShift]}</Typography>
      )
    },
    {
      field: 'turbidityPass',
      headerName: `${t('turbidity')}`,
      width: 120,
      renderCell: (p) =>
        p.value === true ? (
          <Chip label="PASS" size="small" sx={{ bgcolor: '#57CA22', color: '#fff', fontWeight: 700 }} />
        ) : p.value === false ? (
          <Chip label="FAIL" size="small" sx={{ bgcolor: '#FF1943', color: '#fff', fontWeight: 700 }} />
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        )
    },
    {
      field: 'chemicalPpm',
      headerName: `${t('chemical_label')} (PPM)`,
      width: 130,
      renderCell: (p) =>
        p.value != null ? (
          <Chip
            label={`${p.value} ppm`}
            size="small"
            sx={{
              bgcolor: getValueColor(p.value, PPM_LOW, PPM_HIGH),
              color: '#fff',
              fontWeight: 600,
              fontSize: 11
            }}
          />
        ) : <Typography variant="caption" color="text.disabled">—</Typography>
    },
    {
      field: 'toteLevelGallons',
      headerName: `${t('tote_level')} (gal)`,
      width: 130,
      renderCell: (p) =>
        p.value != null ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Typography variant="body2">{p.value} gal</Typography>
          </Stack>
        ) : <Typography variant="caption" color="text.disabled">—</Typography>
    },
    {
      field: 'recordedBy',
      headerName: t('recorded_by'),
      flex: 1,
      valueGetter: (p) =>
        p.row.recordedBy
          ? `${p.row.recordedBy.firstName} ${p.row.recordedBy.lastName}`
          : '—'
    },
    {
      field: 'notes',
      headerName: t('notes'),
      flex: 1,
      valueFormatter: (p) => p.value || '—'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: t('actions'),
      width: 100,
      getActions: (params) => [
        <Tooltip title={t('edit')} key="edit">
          <IconButton size="small" onClick={() => openEdit(params.row as WashTankReading)}>
            <EditTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip title={t('delete')} key="delete">
          <IconButton size="small" color="error" onClick={() => setConfirmDeleteId(params.row.id)}>
            <DeleteTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ]
    }
  ];

  return (
    <Box p={2}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <WaterTwoToneIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h5">{t('wash_tanks')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('wash_tanks_subtitle')}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PrintTwoToneIcon />}
            onClick={handleOpenReport}
          >
            {t('weekly_report')}
          </Button>
          <Button variant="contained" startIcon={<AddTwoToneIcon />} onClick={openAdd}>
            {t('log_reading')}
          </Button>
        </Stack>
      </Stack>

      {/* Tank Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <WaterTwoToneIcon fontSize="small" />
                <span>{t('washtank_1')}</span>
                <Chip
                  label={readings.filter((r) => r.tankNumber === 1).length}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <WaterTwoToneIcon fontSize="small" />
                <span>{t('washtank_2')}</span>
                <Chip
                  label={readings.filter((r) => r.tankNumber === 2).length}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            }
          />
        </Tabs>
      </Paper>

      {/* Stats cards for current tank */}
      <TankStats readings={tankReadings} t={t} />

      {/* Data Grid */}
      <DataGrid
        rows={tankReadings}
        columns={columns}
        loading={loadingGet}
        autoHeight
        disableSelectionOnClick
        pageSize={25}
        rowsPerPageOptions={[10, 25, 50, 100]}
        sx={{ bgcolor: 'background.paper', mt: 2 }}
      />

      {/* Add / Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1} alignItems="center">
            <WaterTwoToneIcon color="primary" />
            <span>
              {editingRecord ? t('edit_reading') : t('log_reading')} —{' '}
              {t(`washtank_${form.tankNumber}`)}
            </span>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={0}>
            {/* Tank selector */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>{t('tank')}</InputLabel>
                <Select
                  value={form.tankNumber}
                  label={t('tank')}
                  onChange={(e) => setForm({ ...form, tankNumber: e.target.value as 1 | 2 })}
                >
                  <MenuItem value={1}>{t('washtank_1')}</MenuItem>
                  <MenuItem value={2}>{t('washtank_2')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Date */}
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('date')}
                type="date"
                value={form.readingDate}
                onChange={(e) => setForm({ ...form, readingDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Shift */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('reading_shift')}</InputLabel>
                <Select
                  value={form.shift}
                  label={t('reading_shift')}
                  onChange={(e) => setForm({ ...form, shift: e.target.value as WashTankShift })}
                >
                  {shifts.map((s) => (
                    <MenuItem key={s} value={s}>
                      {shiftLabels[s]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Divider>{t('water_quality_readings')}</Divider>
            </Grid>

            {/* Turbidity Pass/Fail */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{t('turbidity')}</InputLabel>
                <Select
                  value={form.turbidityPass}
                  label={t('turbidity')}
                  onChange={(e) =>
                    setForm({ ...form, turbidityPass: e.target.value as 'PASS' | 'FAIL' | '' })
                  }
                >
                  <MenuItem value="">{t('not_recorded')}</MenuItem>
                  <MenuItem value="PASS">
                    <Chip label="PASS" size="small" sx={{ bgcolor: '#57CA22', color: '#fff', fontWeight: 700 }} />
                  </MenuItem>
                  <MenuItem value="FAIL">
                    <Chip label="FAIL" size="small" sx={{ bgcolor: '#FF1943', color: '#fff', fontWeight: 700 }} />
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Chemical PPM */}
            <Grid item xs={12} sm={4}>
              <TextField
                label={`${t('chemical_label')} (PPM)`}
                value={form.chemicalPpm}
                onChange={(e) => setForm({ ...form, chemicalPpm: e.target.value })}
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 1 }}
                helperText={t('chemical_ppm_hint')}
              />
            </Grid>

            {/* Tote Level */}
            <Grid item xs={12} sm={4}>
              <TextField
                label={`${t('tote_level')} (gal)`}
                value={form.toteLevelGallons}
                onChange={(e) => setForm({ ...form, toteLevelGallons: e.target.value })}
                fullWidth
                type="number"
                inputProps={{ min: 0, step: 0.5 }}
                helperText={t('tote_level_hint')}
              />
            </Grid>

            {/* Recorded by */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t('recorded_by')} ({t('optional')})</InputLabel>
                <Select
                  value={form.recordedById}
                  label={`${t('recorded_by')} (${t('optional')})`}
                  onChange={(e) => setForm({ ...form, recordedById: e.target.value as number | '' })}
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

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                label={t('notes')}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder={t('reading_notes_placeholder')}
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

      {/* Confirm Delete */}
      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>{t('confirm_delete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('reading_delete_confirm')}</Typography>
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

      {/* Weekly Report Dialog */}
      <Dialog open={reportOpen} onClose={() => setReportOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('weekly_wash_tank_report')}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label={t('week_starting')}
                type="date"
                value={reportWeekStart}
                onChange={(e) => setReportWeekStart(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 7 }}
              />
              <Button variant="outlined" size="small" onClick={handleOpenReport}>
                {t('load')}
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintTwoToneIcon />}
                onClick={handlePrint}
              >
                {t('print')}
              </Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <WeeklyReportContent
            readings={weeklyReadings}
            weekStart={reportWeekStart}
            printRef={printRef}
            t={t}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportOpen(false)}>{t('close')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function TankStats({ readings, t }: { readings: WashTankReading[]; t: any }) {
  const today = dayjs().format('YYYY-MM-DD');
  const todayReadings = readings.filter((r) => r.readingDate === today);
  const lastReading = readings[0];

  const turbidityReadings = todayReadings.filter((r) => r.turbidityPass != null);
  const turbidityFails = turbidityReadings.filter((r) => r.turbidityPass === false).length;
  const turbidityDisplay =
    turbidityReadings.length === 0 ? '—' :
    turbidityFails === 0 ? 'ALL PASS' : `${turbidityFails} FAIL`;
  const turbidityColor =
    turbidityReadings.length === 0 ? 'text.secondary' :
    turbidityFails > 0 ? '#FF1943' : '#57CA22';

  const avgPpm =
    todayReadings.length > 0
      ? (
          todayReadings.reduce((s, r) => s + (r.chemicalPpm ?? 0), 0) /
          todayReadings.filter((r) => r.chemicalPpm != null).length
        ).toFixed(1)
      : null;

  const latestTote = lastReading?.toteLevelGallons;

  return (
    <Grid container spacing={2} mb={1}>
      {[
        {
          label: t('todays_readings'),
          value: `${todayReadings.length} / 4`,
          color: todayReadings.length < 4 ? '#FFA319' : '#57CA22',
          hint: t('readings_taken_today')
        },
        {
          label: t('turbidity_today'),
          value: turbidityDisplay,
          color: turbidityColor,
          hint: t('turbidity_pass_fail_hint')
        },
        {
          label: `${t('avg_ppm_today')}`,
          value: avgPpm ? `${avgPpm} ppm` : '—',
          color: avgPpm ? getValueColor(parseFloat(avgPpm), PPM_LOW, PPM_HIGH) : 'text.secondary',
          hint: `${t('wt_target')}: ${PPM_LOW}–${PPM_HIGH} ppm`
        },
        {
          label: t('tote_level'),
          value: latestTote != null ? `${latestTote} gal` : '—',
          color: latestTote != null && latestTote < 20 ? '#FF1943' : 'text.secondary',
          hint: latestTote != null && latestTote < 20 ? t('tote_low_warning') : t('last_recorded')
        }
      ].map((stat) => (
        <Grid item xs={6} sm={3} key={stat.label}>
          <Paper sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {stat.label}
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
              {stat.hint}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

/* ─── Weekly Report Content (also used for printing) ─── */
interface WeeklyReportContentProps {
  readings: WashTankReading[];
  weekStart: string;
  printRef: React.RefObject<HTMLDivElement>;
  t: any;
}

function WeeklyReportContent({ readings, weekStart, printRef, t }: WeeklyReportContentProps) {
  const ws = dayjs(weekStart).startOf('isoWeek');
  const days = Array.from({ length: 7 }, (_, i) => ws.add(i, 'day'));
  const tank1 = readings.filter((r) => r.tankNumber === 1);
  const tank2 = readings.filter((r) => r.tankNumber === 2);

  const getReading = (list: WashTankReading[], date: string, shift: WashTankShift) =>
    list.find((r) => r.readingDate === date && r.shift === shift);

  const cellStyle = (pass?: boolean | null, ppm?: number | null) => {
    if (pass === false) return 'alert';
    if (ppm != null && (ppm < PPM_LOW || ppm > PPM_HIGH)) return 'warn';
    return '';
  };

  const renderTankTable = (tankReadings: WashTankReading[], tankNum: number) => (
    <>
      <h2>Washtank {tankNum}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            {shifts.map((s) => (
              <th key={s} colSpan={3} style={{ textAlign: 'center' }}>
                {shiftLabels[s].replace('Shift ', 'S')}
              </th>
            ))}
          </tr>
          <tr>
            <th></th>
            {shifts.map((s) => (
              <React.Fragment key={s}>
                <th>Turbidity</th>
                <th>PPM</th>
                <th>Tote (gal)</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => {
            const dateStr = day.format('YYYY-MM-DD');
            return (
              <tr key={dateStr}>
                <td><strong>{day.format('ddd MM/DD')}</strong></td>
                {shifts.map((s) => {
                  const r = getReading(tankReadings, dateStr, s);
                  const cls = r ? cellStyle(r.turbidityPass, r.chemicalPpm) : '';
                  return (
                    <React.Fragment key={s}>
                      <td className={cls}>
                        {r?.turbidityPass === true ? 'PASS' : r?.turbidityPass === false ? 'FAIL' : '—'}
                      </td>
                      <td className={cls}>
                        {r?.chemicalPpm != null ? r.chemicalPpm : '—'}
                      </td>
                      <td>
                        {r?.toteLevelGallons != null ? r.toteLevelGallons : '—'}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );

  return (
    <Box ref={printRef}>
      {/* Print header */}
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: 8, marginBottom: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18 }}>Weekly Wash Tank Water Quality Log</h1>
          <div style={{ fontSize: 12, color: '#555' }}>
            Week of {ws.format('MMMM D')} – {ws.add(6, 'day').format('MMMM D, YYYY')}
          </div>
        </div>
        <div style={{ fontSize: 11, textAlign: 'right', color: '#555' }}>
          <div>Turbidity: Pass / Fail</div>
          <div>Chemical target: {PPM_LOW}–{PPM_HIGH} PPM</div>
          <div>Printed: {dayjs().format('MM/DD/YYYY h:mm A')}</div>
        </div>
      </div>

      {/* Legend */}
      <Box mb={1} p={1} sx={{ bgcolor: '#f8f8f8', border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="caption">
          <span style={{ color: '#FF1943', fontWeight: 'bold' }}>■ Red</span>: Turbidity FAIL or PPM out of range &nbsp;|&nbsp;
          <span style={{ color: '#c97a00', fontWeight: 'bold' }}>■ Yellow</span>: PPM warning ({PPM_LOW}–{PPM_HIGH} ppm target)
        </Typography>
      </Box>

      {/* On-screen tables */}
      <Box sx={{ overflowX: 'auto' }}>
        {[1, 2].map((tankNum) => {
          const tankReadings = tankNum === 1 ? tank1 : tank2;
          return (
            <Box key={tankNum} mb={3}>
              <Typography variant="h6" fontWeight={700} gutterBottom
                sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 0.5 }}>
                Washtank {tankNum}
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#333', color: '#fff' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Date</th>
                      {shifts.map((s) => (
                        <th key={s} colSpan={3} style={{ padding: '6px 8px', textAlign: 'center', borderLeft: '1px solid #555' }}>
                          {shiftLabels[s]}
                        </th>
                      ))}
                    </tr>
                    <tr style={{ background: '#555', color: '#fff' }}>
                      <th></th>
                      {shifts.map((s) => (
                        <React.Fragment key={s}>
                          <th style={{ padding: '4px 8px', borderLeft: '1px solid #666', fontSize: 11 }}>Turbidity</th>
                          <th style={{ padding: '4px 8px', fontSize: 11 }}>PPM</th>
                          <th style={{ padding: '4px 8px', fontSize: 11 }}>Tote (gal)</th>
                        </React.Fragment>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day, di) => {
                      const dateStr = day.format('YYYY-MM-DD');
                      return (
                        <tr key={dateStr} style={{ background: di % 2 === 0 ? '#fff' : '#f5f5f5' }}>
                          <td style={{ padding: '5px 8px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                            {day.format('ddd MM/DD')}
                          </td>
                          {shifts.map((s) => {
                            const r = getReading(tankReadings, dateStr, s);
                            const turbFail = r?.turbidityPass === false;
                            const turbPass = r?.turbidityPass === true;
                            const hasPpmAlert = r?.chemicalPpm != null && (r.chemicalPpm < PPM_LOW || r.chemicalPpm > PPM_HIGH);
                            return (
                              <React.Fragment key={s}>
                                <td style={{
                                  padding: '4px 8px', borderLeft: '1px solid #ddd',
                                  color: turbFail ? '#cc0000' : turbPass ? '#1a7a1a' : '#999',
                                  fontWeight: (turbFail || turbPass) ? 'bold' : 'normal'
                                }}>
                                  {r?.turbidityPass === true ? 'PASS' : r?.turbidityPass === false ? 'FAIL' : ''}
                                </td>
                                <td style={{
                                  padding: '4px 8px',
                                  color: hasPpmAlert ? '#c97a00' : '#000',
                                  fontWeight: hasPpmAlert ? 'bold' : 'normal'
                                }}>
                                  {r?.chemicalPpm != null ? r.chemicalPpm : ''}
                                </td>
                                <td style={{ padding: '4px 8px' }}>
                                  {r?.toteLevelGallons != null ? r.toteLevelGallons : ''}
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Box>

              {/* Summary row */}
              <SummaryRow readings={tankReadings} days={days} t={t} />
            </Box>
          );
        })}
      </Box>

      <div style={{ marginTop: 20, fontSize: 11, color: '#666', borderTop: '1px solid #ccc', paddingTop: 8 }}>
        Signature: ___________________________ Date: _____________ Supervisor: ___________________________
      </div>
    </Box>
  );
}

function SummaryRow({ readings, days, t }: { readings: WashTankReading[]; days: dayjs.Dayjs[]; t: any }) {
  const allThisWeek = readings.filter((r) =>
    days.some((d) => d.format('YYYY-MM-DD') === r.readingDate)
  );

  const turbChecked = allThisWeek.filter((r) => r.turbidityPass != null);
  const turbPasses = turbChecked.filter((r) => r.turbidityPass === true).length;
  const turbSummary = turbChecked.length > 0 ? `${turbPasses}/${turbChecked.length} PASS` : '—';
  const validPpm = allThisWeek.filter((r) => r.chemicalPpm != null);

  const avgPpm = validPpm.length > 0
    ? (validPpm.reduce((s, r) => s + r.chemicalPpm!, 0) / validPpm.length).toFixed(1)
    : '—';
  const totalReadings = allThisWeek.length;
  const expectedReadings = days.length * 4;

  return (
    <Box mt={0.5} p={1} sx={{ bgcolor: 'action.hover', borderRadius: 1 }}>
      <Stack direction="row" spacing={3}>
        <Typography variant="caption">
          <strong>{t('weekly_summary')}:</strong>
        </Typography>
        <Typography variant="caption">
          {t('wt_readings')}: {totalReadings}/{expectedReadings}
        </Typography>
        <Typography variant="caption">
          {t('turbidity')}: <strong>{turbSummary}</strong>
        </Typography>
        <Typography variant="caption">
          {t('avg_ppm')}: <strong>{avgPpm} ppm</strong>
        </Typography>
      </Stack>
    </Box>
  );
}

export default WashTank;
