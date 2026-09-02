import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HearingTwoToneIcon from '@mui/icons-material/HearingTwoTone';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs, { Dayjs } from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import { useDispatch, useSelector } from '../../../store';
import {
  getHearingConservationRecords,
  createHearingConservationRecord,
  updateHearingConservationRecord,
  deleteHearingConservationRecord
} from '../../../slices/hearingConservation';
import HearingConservationRecord, {
  NoiseAreaRow,
  HpdDeviceRow
} from '../../../models/owns/hearingConservation';

function parseJson<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

interface FormValues {
  programDate: Dayjs | null;
  programAdmin: string;
  reviewDate: Dayjs | null;
  noiseAreas: NoiseAreaRow[];
  hpdDevices: HpdDeviceRow[];
  hpdStorageLocations: string;
  requiredUseAreas: string;
  audiometricPositions: string;
  audiometricProvider: string;
  audiometricSchedule: string;
  baselineProcedure: string;
  annualProcedure: string;
  thresholdShiftProcedure: string;
  trainingProgram: string;
  trainingTopics: string;
  trainingSchedule: string;
  noiseMeasurementRecordsLocation: string;
  audiometricRecordsLocation: string;
  recordsAccessProcedure: string;
  lastEvaluationDate: Dayjs | null;
  evaluationNotes: string;
  deficienciesFound: string;
  correctiveActions: string;
}

const emptyForm: FormValues = {
  programDate: dayjs(),
  programAdmin: '',
  reviewDate: null,
  noiseAreas: [],
  hpdDevices: [],
  hpdStorageLocations: '',
  requiredUseAreas: '',
  audiometricPositions: '',
  audiometricProvider: '',
  audiometricSchedule: '',
  baselineProcedure: '',
  annualProcedure: '',
  thresholdShiftProcedure: '',
  trainingProgram: '',
  trainingTopics: '',
  trainingSchedule: '',
  noiseMeasurementRecordsLocation: '',
  audiometricRecordsLocation: '',
  recordsAccessProcedure: '',
  lastEvaluationDate: null,
  evaluationNotes: '',
  deficienciesFound: '',
  correctiveActions: ''
};

function recordToForm(r: HearingConservationRecord): FormValues {
  return {
    programDate: r.programDate ? dayjs(r.programDate) : null,
    programAdmin: r.programAdmin ?? '',
    reviewDate: r.reviewDate ? dayjs(r.reviewDate) : null,
    noiseAreas: parseJson<NoiseAreaRow[]>(r.noiseAreas, []),
    hpdDevices: parseJson<HpdDeviceRow[]>(r.hpdDevices, []),
    hpdStorageLocations: r.hpdStorageLocations ?? '',
    requiredUseAreas: r.requiredUseAreas ?? '',
    audiometricPositions: r.audiometricPositions ?? '',
    audiometricProvider: r.audiometricProvider ?? '',
    audiometricSchedule: r.audiometricSchedule ?? '',
    baselineProcedure: r.baselineProcedure ?? '',
    annualProcedure: r.annualProcedure ?? '',
    thresholdShiftProcedure: r.thresholdShiftProcedure ?? '',
    trainingProgram: r.trainingProgram ?? '',
    trainingTopics: r.trainingTopics ?? '',
    trainingSchedule: r.trainingSchedule ?? '',
    noiseMeasurementRecordsLocation: r.noiseMeasurementRecordsLocation ?? '',
    audiometricRecordsLocation: r.audiometricRecordsLocation ?? '',
    recordsAccessProcedure: r.recordsAccessProcedure ?? '',
    lastEvaluationDate: r.lastEvaluationDate ? dayjs(r.lastEvaluationDate) : null,
    evaluationNotes: r.evaluationNotes ?? '',
    deficienciesFound: r.deficienciesFound ?? '',
    correctiveActions: r.correctiveActions ?? ''
  };
}

function formToPayload(f: FormValues): Partial<HearingConservationRecord> {
  return {
    programDate: f.programDate ? f.programDate.format('YYYY-MM-DD') : null,
    programAdmin: f.programAdmin,
    reviewDate: f.reviewDate ? f.reviewDate.format('YYYY-MM-DD') : null,
    noiseAreas: JSON.stringify(f.noiseAreas),
    hpdDevices: JSON.stringify(f.hpdDevices),
    hpdStorageLocations: f.hpdStorageLocations,
    requiredUseAreas: f.requiredUseAreas,
    audiometricPositions: f.audiometricPositions,
    audiometricProvider: f.audiometricProvider,
    audiometricSchedule: f.audiometricSchedule,
    baselineProcedure: f.baselineProcedure,
    annualProcedure: f.annualProcedure,
    thresholdShiftProcedure: f.thresholdShiftProcedure,
    trainingProgram: f.trainingProgram,
    trainingTopics: f.trainingTopics,
    trainingSchedule: f.trainingSchedule,
    noiseMeasurementRecordsLocation: f.noiseMeasurementRecordsLocation,
    audiometricRecordsLocation: f.audiometricRecordsLocation,
    recordsAccessProcedure: f.recordsAccessProcedure,
    lastEvaluationDate: f.lastEvaluationDate
      ? f.lastEvaluationDate.format('YYYY-MM-DD')
      : null,
    evaluationNotes: f.evaluationNotes,
    deficienciesFound: f.deficienciesFound,
    correctiveActions: f.correctiveActions
  };
}

export default function HearingConservation() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const records = useSelector((s) => s.hearingConservation.records);
  const loadingGet = useSelector((s) => s.hearingConservation.loadingGet);

  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<HearingConservationRecord | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | false>('section-program');
  const [viewingRecord, setViewingRecord] = useState<HearingConservationRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<HearingConservationRecord | null>(null);

  useEffect(() => {
    setTitle(t('hearing_conservation'));
    dispatch(getHearingConservationRecords());
  }, []);

  function openNew() {
    setEditingRecord(null);
    setForm(emptyForm);
    setExpanded('section-program');
    setOpenDialog(true);
  }

  function openEdit(r: HearingConservationRecord) {
    setEditingRecord(r);
    setForm(recordToForm(r));
    setExpanded('section-program');
    setOpenDialog(true);
  }

  function openView(r: HearingConservationRecord) {
    setViewingRecord(r);
  }

  function handlePrint(r: HearingConservationRecord) {
    setPrintRecord(r);
    setViewingRecord(null);
    setTimeout(() => window.print(), 100);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingRecord) {
        await dispatch(updateHearingConservationRecord(editingRecord.id, payload));
        showSnackBar(t('hcp_updated'), 'success');
      } else {
        await dispatch(createHearingConservationRecord(payload));
        showSnackBar(t('hcp_created'), 'success');
      }
      setOpenDialog(false);
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await dispatch(deleteHearingConservationRecord(id));
      showSnackBar(t('hcp_deleted'), 'success');
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    }
    setConfirmDeleteId(null);
  }

  /* ── Noise Area row helpers ── */
  function addNoiseArea() {
    setForm((f) => ({
      ...f,
      noiseAreas: [
        ...f.noiseAreas,
        { id: uuidv4(), area: '', noiseLevelDb: '', measurementDate: '', instrument: '' }
      ]
    }));
  }
  function updateNoiseArea(id: string, field: keyof NoiseAreaRow, value: string) {
    setForm((f) => ({
      ...f,
      noiseAreas: f.noiseAreas.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    }));
  }
  function removeNoiseArea(id: string) {
    setForm((f) => ({ ...f, noiseAreas: f.noiseAreas.filter((r) => r.id !== id) }));
  }

  /* ── HPD Device row helpers ── */
  function addHpd() {
    setForm((f) => ({
      ...f,
      hpdDevices: [...f.hpdDevices, { id: uuidv4(), brand: '', sizes: '' }]
    }));
  }
  function updateHpd(id: string, field: keyof HpdDeviceRow, value: string) {
    setForm((f) => ({
      ...f,
      hpdDevices: f.hpdDevices.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    }));
  }
  function removeHpd(id: string) {
    setForm((f) => ({ ...f, hpdDevices: f.hpdDevices.filter((r) => r.id !== id) }));
  }

  const section = (key: string, label: string, content: React.ReactNode) => (
    <Accordion
      expanded={expanded === key}
      onChange={(_, isExpanded) => setExpanded(isExpanded ? key : false)}
      key={key}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600}>{label}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container spacing={2}>
          {content}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );

  const tf = (
    label: string,
    field: keyof FormValues,
    rows?: number,
    placeholder?: string
  ) => (
    <Grid item xs={12} sm={rows ? 12 : 6} key={field}>
      <TextField
        label={label}
        value={(form[field] as string) ?? ''}
        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        fullWidth
        multiline={!!rows}
        rows={rows}
        placeholder={placeholder}
      />
    </Grid>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box p={3}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <HearingTwoToneIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h4">{t('hearing_conservation')}</Typography>
              <Typography variant="subtitle2" color="text.secondary">
                {t('hearing_conservation_subtitle')}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddTwoToneIcon />}
            onClick={openNew}
          >
            {t('hcp_new_record')}
          </Button>
        </Box>

        <Alert severity="info" sx={{ mb: 2 }}>
          {t('hcp_wac_note')}
        </Alert>

        {/* Records list */}
        {loadingGet ? (
          <Typography>{t('loading')}…</Typography>
        ) : records.length === 0 ? (
          <Typography color="text.secondary">
            No Hearing Conservation records yet. Click &quot;New HCP Record&quot; to create one.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('hcp_program_date')}</TableCell>
                  <TableCell>{t('hcp_program_admin')}</TableCell>
                  <TableCell>{t('hcp_review_date')}</TableCell>
                  <TableCell align="right">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>
                      {r.programDate ? dayjs(r.programDate).format('MM/DD/YYYY') : '—'}
                    </TableCell>
                    <TableCell>{r.programAdmin || '—'}</TableCell>
                    <TableCell>
                      {r.reviewDate ? dayjs(r.reviewDate).format('MM/DD/YYYY') : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={t('view')}>
                        <IconButton size="small" onClick={() => openView(r)}>
                          <VisibilityTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('edit')}>
                        <IconButton size="small" onClick={() => openEdit(r)}>
                          <EditTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setConfirmDeleteId(r.id)}
                        >
                          <DeleteTwoToneIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Create / Edit Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingRecord ? t('hcp_edit_record') : t('hcp_new_record')}
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>

            {/* Section 1 – Program Info */}
            {section(
              'section-program',
              `1. ${t('hcp_program_info')}`,
              <>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label={t('hcp_program_date')}
                    value={form.programDate}
                    onChange={(val) => setForm({ ...form, programDate: val })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label={t('hcp_review_date')}
                    value={form.reviewDate}
                    onChange={(val) => setForm({ ...form, reviewDate: val })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                {tf(t('hcp_program_admin'), 'programAdmin')}
              </>
            )}

            {/* Section 2 – Noise Areas */}
            {section(
              'section-noise',
              `2. ${t('hcp_noise_areas')}`,
              <>
                <Grid item xs={12}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('hcp_area')}</TableCell>
                          <TableCell>{t('hcp_noise_level')}</TableCell>
                          <TableCell>{t('hcp_measurement_date')}</TableCell>
                          <TableCell>{t('hcp_instrument')}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {form.noiseAreas.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.area}
                                onChange={(e) =>
                                  updateNoiseArea(row.id, 'area', e.target.value)
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.noiseLevelDb}
                                onChange={(e) =>
                                  updateNoiseArea(row.id, 'noiseLevelDb', e.target.value)
                                }
                                sx={{ width: 90 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.measurementDate}
                                placeholder="MM/DD/YYYY"
                                onChange={(e) =>
                                  updateNoiseArea(row.id, 'measurementDate', e.target.value)
                                }
                                sx={{ width: 130 }}
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.instrument}
                                onChange={(e) =>
                                  updateNoiseArea(row.id, 'instrument', e.target.value)
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeNoiseArea(row.id)}
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    size="small"
                    startIcon={<AddTwoToneIcon />}
                    onClick={addNoiseArea}
                  >
                    {t('hcp_add_noise_area')}
                  </Button>
                </Grid>
              </>
            )}

            {/* Section 3 – Hearing Protection */}
            {section(
              'section-hpd',
              `3. ${t('hcp_hearing_protection')}`,
              <>
                <Grid item xs={12}>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>{t('hcp_hpd_brand')}</TableCell>
                          <TableCell>{t('hcp_hpd_sizes')}</TableCell>
                          <TableCell />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {form.hpdDevices.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.brand}
                                onChange={(e) =>
                                  updateHpd(row.id, 'brand', e.target.value)
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.sizes}
                                onChange={(e) =>
                                  updateHpd(row.id, 'sizes', e.target.value)
                                }
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeHpd(row.id)}
                              >
                                <DeleteTwoToneIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    size="small"
                    startIcon={<AddTwoToneIcon />}
                    onClick={addHpd}
                  >
                    {t('hcp_add_hpd')}
                  </Button>
                </Grid>
                {tf(t('hcp_hpd_storage'), 'hpdStorageLocations', 2)}
                {tf(t('hcp_required_use_areas'), 'requiredUseAreas', 2)}
              </>
            )}

            {/* Section 4 – Audiometric Testing */}
            {section(
              'section-audio',
              `4. ${t('hcp_audiometric')}`,
              <>
                {tf(t('hcp_audiometric_positions'), 'audiometricPositions', 2)}
                {tf(t('hcp_audiometric_provider'), 'audiometricProvider')}
                {tf(t('hcp_audiometric_schedule'), 'audiometricSchedule', 2)}
                {tf(t('hcp_baseline_procedure'), 'baselineProcedure', 3)}
                {tf(t('hcp_annual_procedure'), 'annualProcedure', 3)}
                {tf(t('hcp_threshold_shift'), 'thresholdShiftProcedure', 3)}
              </>
            )}

            {/* Section 5 – Training */}
            {section(
              'section-training',
              `5. ${t('hcp_training')}`,
              <>
                {tf(t('hcp_training_program'), 'trainingProgram', 3)}
                {tf(t('hcp_training_topics'), 'trainingTopics', 3)}
                {tf(t('hcp_training_schedule'), 'trainingSchedule', 2)}
              </>
            )}

            {/* Section 6 – Access to Records */}
            {section(
              'section-records',
              `6. ${t('hcp_records')}`,
              <>
                {tf(t('hcp_noise_records_location'), 'noiseMeasurementRecordsLocation', 2)}
                {tf(t('hcp_audiometric_records_location'), 'audiometricRecordsLocation', 2)}
                {tf(t('hcp_records_access'), 'recordsAccessProcedure', 2)}
              </>
            )}

            {/* Section 7 – Program Evaluation */}
            {section(
              'section-eval',
              `7. ${t('hcp_evaluation')}`,
              <>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label={t('hcp_last_evaluation')}
                    value={form.lastEvaluationDate}
                    onChange={(val) => setForm({ ...form, lastEvaluationDate: val })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                {tf(t('hcp_evaluation_notes'), 'evaluationNotes', 3)}
                {tf(t('hcp_deficiencies'), 'deficienciesFound', 3)}
                {tf(t('hcp_corrective_actions'), 'correctiveActions', 3)}
              </>
            )}
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
            <Typography>{t('hcp_delete_confirm')}</Typography>
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

        {/* ── View (Read-Only) Dialog ── */}
        <Dialog
          open={viewingRecord !== null}
          onClose={() => setViewingRecord(null)}
          maxWidth="md"
          fullWidth
        >
          {viewingRecord && (
            <>
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <HearingTwoToneIcon color="primary" />
                  <span>{t('hearing_conservation')} — {t('hcp_view_record')}</span>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                <HcpReadOnlyView record={viewingRecord} t={t} />
              </DialogContent>
              <DialogActions>
                <Button
                  startIcon={<PrintTwoToneIcon />}
                  variant="outlined"
                  onClick={() => handlePrint(viewingRecord)}
                >
                  {t('print')}
                </Button>
                <Button onClick={() => setViewingRecord(null)}>{t('close')}</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* ── Hidden print-only layout ── */}
        <div id="hcp-print-view" style={{ display: 'none' }}>
          {printRecord && <HcpPrintLayout record={printRecord} t={t} />}
        </div>
      </Box>
    </LocalizationProvider>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Read-only view used inside the dialog                                       */
/* ─────────────────────────────────────────────────────────────────────────── */
function HcpReadOnlyView({ record, t }: { record: HearingConservationRecord; t: any }) {
  const noiseAreas: NoiseAreaRow[] = (() => { try { return JSON.parse(record.noiseAreas || '[]'); } catch { return []; } })();
  const hpdDevices: HpdDeviceRow[] = (() => { try { return JSON.parse(record.hpdDevices || '[]'); } catch { return []; } })();

  const field = (label: string, value: string | null | undefined) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value || '—'}</Typography>
    </Grid>
  );
  const fullField = (label: string, value: string | null | undefined) => (
    <Grid item xs={12}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{value || '—'}</Typography>
    </Grid>
  );

  return (
    <Box>
      {/* 1. Program Info */}
      <Typography variant="subtitle1" fontWeight={700} mt={1} mb={1}>1. {t('hcp_program_info')}</Typography>
      <Grid container spacing={2}>
        {field(t('hcp_program_date'), record.programDate ? dayjs(record.programDate).format('MM/DD/YYYY') : null)}
        {field(t('hcp_review_date'), record.reviewDate ? dayjs(record.reviewDate).format('MM/DD/YYYY') : null)}
        {field(t('hcp_program_admin'), record.programAdmin)}
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* 2. Noise Areas */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>2. {t('hcp_noise_areas')}</Typography>
      {noiseAreas.length === 0 ? (
        <Typography variant="body2" color="text.secondary">—</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('hcp_area')}</TableCell>
                <TableCell>{t('hcp_noise_level')}</TableCell>
                <TableCell>{t('hcp_measurement_date')}</TableCell>
                <TableCell>{t('hcp_instrument')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {noiseAreas.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.area || '—'}</TableCell>
                  <TableCell>{row.noiseLevelDb || '—'}</TableCell>
                  <TableCell>{row.measurementDate || '—'}</TableCell>
                  <TableCell>{row.instrument || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Divider sx={{ my: 2 }} />

      {/* 3. Hearing Protection */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>3. {t('hcp_hearing_protection')}</Typography>
      {hpdDevices.length > 0 && (
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('hcp_hpd_brand')}</TableCell>
                <TableCell>{t('hcp_hpd_sizes')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {hpdDevices.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.brand || '—'}</TableCell>
                  <TableCell>{row.sizes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Grid container spacing={2}>
        {fullField(t('hcp_hpd_storage'), record.hpdStorageLocations)}
        {fullField(t('hcp_required_use_areas'), record.requiredUseAreas)}
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* 4. Audiometric */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>4. {t('hcp_audiometric')}</Typography>
      <Grid container spacing={2}>
        {fullField(t('hcp_audiometric_positions'), record.audiometricPositions)}
        {field(t('hcp_audiometric_provider'), record.audiometricProvider)}
        {fullField(t('hcp_audiometric_schedule'), record.audiometricSchedule)}
        {fullField(t('hcp_baseline_procedure'), record.baselineProcedure)}
        {fullField(t('hcp_annual_procedure'), record.annualProcedure)}
        {fullField(t('hcp_threshold_shift'), record.thresholdShiftProcedure)}
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* 5. Training */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>5. {t('hcp_training')}</Typography>
      <Grid container spacing={2}>
        {fullField(t('hcp_training_program'), record.trainingProgram)}
        {fullField(t('hcp_training_topics'), record.trainingTopics)}
        {fullField(t('hcp_training_schedule'), record.trainingSchedule)}
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* 6. Records */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>6. {t('hcp_records')}</Typography>
      <Grid container spacing={2}>
        {fullField(t('hcp_noise_records_location'), record.noiseMeasurementRecordsLocation)}
        {fullField(t('hcp_audiometric_records_location'), record.audiometricRecordsLocation)}
        {fullField(t('hcp_records_access'), record.recordsAccessProcedure)}
      </Grid>
      <Divider sx={{ my: 2 }} />

      {/* 7. Evaluation */}
      <Typography variant="subtitle1" fontWeight={700} mb={1}>7. {t('hcp_evaluation')}</Typography>
      <Grid container spacing={2}>
        {field(t('hcp_last_evaluation'), record.lastEvaluationDate ? dayjs(record.lastEvaluationDate).format('MM/DD/YYYY') : null)}
        {fullField(t('hcp_evaluation_notes'), record.evaluationNotes)}
        {fullField(t('hcp_deficiencies'), record.deficienciesFound)}
        {fullField(t('hcp_corrective_actions'), record.correctiveActions)}
      </Grid>
    </Box>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Print-only layout (hidden on screen, shown during window.print())           */
/* ─────────────────────────────────────────────────────────────────────────── */
function HcpPrintLayout({ record, t }: { record: HearingConservationRecord; t: any }) {
  const noiseAreas: NoiseAreaRow[] = (() => { try { return JSON.parse(record.noiseAreas || '[]'); } catch { return []; } })();
  const hpdDevices: HpdDeviceRow[] = (() => { try { return JSON.parse(record.hpdDevices || '[]'); } catch { return []; } })();

  const s: React.CSSProperties = {
    fontFamily: 'Arial, sans-serif',
    fontSize: '11pt',
    color: '#000',
    margin: 0,
    padding: '24px'
  };
  const h1: React.CSSProperties = { fontSize: '16pt', fontWeight: 'bold', marginBottom: 4 };
  const h2: React.CSSProperties = { fontSize: '12pt', fontWeight: 'bold', marginTop: 18, marginBottom: 6, borderBottom: '1px solid #000', paddingBottom: 2 };
  const label: React.CSSProperties = { fontSize: '9pt', color: '#555', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' };
  const value: React.CSSProperties = { marginTop: 2, marginBottom: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word' };
  const row2: React.CSSProperties = { display: 'flex', gap: 32, flexWrap: 'wrap' };
  const col2: React.CSSProperties = { flex: '1 1 280px' };

  const F = ({ lbl, val }: { lbl: string; val?: string | null }) => (
    <div style={col2}>
      <div style={label}>{lbl}</div>
      <div style={value}>{val || '—'}</div>
    </div>
  );

  const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', marginBottom: 12, fontSize: '10pt' };
  const th: React.CSSProperties = { border: '1px solid #999', padding: '4px 8px', background: '#f0f0f0', fontWeight: 'bold', textAlign: 'left' };
  const td: React.CSSProperties = { border: '1px solid #ccc', padding: '4px 8px' };

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={h1}>Hearing Loss Prevention Program</div>
          <div style={{ fontSize: '10pt', color: '#444' }}>WAC 296-817 — Bay Baby Produce</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '9pt', color: '#666' }}>
          <div>Program Date: {record.programDate ? dayjs(record.programDate).format('MM/DD/YYYY') : '—'}</div>
          <div>Next Review: {record.reviewDate ? dayjs(record.reviewDate).format('MM/DD/YYYY') : '—'}</div>
          <div>Administrator: {record.programAdmin || '—'}</div>
          <div style={{ marginTop: 4 }}>Printed: {dayjs().format('MM/DD/YYYY h:mm A')}</div>
        </div>
      </div>

      {/* Section 2 */}
      {noiseAreas.length > 0 && (
        <>
          <div style={h2}>2. Noise Areas &amp; Measurements</div>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={th}>Area / Equipment / Job Duties</th>
                <th style={th}>Noise Level (dBA)</th>
                <th style={th}>Date Measured</th>
                <th style={th}>Instrument Used</th>
              </tr>
            </thead>
            <tbody>
              {noiseAreas.map((r) => (
                <tr key={r.id}>
                  <td style={td}>{r.area || '—'}</td>
                  <td style={td}>{r.noiseLevelDb || '—'}</td>
                  <td style={td}>{r.measurementDate || '—'}</td>
                  <td style={td}>{r.instrument || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Section 3 */}
      <div style={h2}>3. Hearing Protection Devices (HPDs)</div>
      {hpdDevices.length > 0 && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={th}>Brand Name</th>
              <th style={th}>Sizes Available</th>
            </tr>
          </thead>
          <tbody>
            {hpdDevices.map((r) => (
              <tr key={r.id}>
                <td style={td}>{r.brand || '—'}</td>
                <td style={td}>{r.sizes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div style={row2}>
        <F lbl="Storage / Access Locations" val={record.hpdStorageLocations} />
        <F lbl="Areas Where HPDs Are Required" val={record.requiredUseAreas} />
      </div>

      {/* Section 4 */}
      <div style={h2}>4. Audiometric Testing</div>
      <div style={row2}>
        <F lbl="Positions / Areas Covered" val={record.audiometricPositions} />
        <F lbl="Testing Provider" val={record.audiometricProvider} />
      </div>
      <F lbl="Testing Schedule" val={record.audiometricSchedule} />
      <F lbl="Baseline Testing Procedure" val={record.baselineProcedure} />
      <F lbl="Annual Testing Procedure" val={record.annualProcedure} />
      <F lbl="Standard Threshold Shift Notification Procedure" val={record.thresholdShiftProcedure} />

      {/* Section 5 */}
      <div style={h2}>5. Training</div>
      <F lbl="Training Program Description" val={record.trainingProgram} />
      <F lbl="Topics Covered" val={record.trainingTopics} />
      <F lbl="Training Schedule / Frequency" val={record.trainingSchedule} />

      {/* Section 6 */}
      <div style={h2}>6. Access to Records</div>
      <div style={row2}>
        <F lbl="Location of Noise Measurement Records" val={record.noiseMeasurementRecordsLocation} />
        <F lbl="Location of Audiometric Records" val={record.audiometricRecordsLocation} />
      </div>
      <F lbl="Employee Access Procedure" val={record.recordsAccessProcedure} />

      {/* Section 7 */}
      <div style={h2}>7. Program Evaluation</div>
      <F lbl="Last Program Evaluation Date" val={record.lastEvaluationDate ? dayjs(record.lastEvaluationDate).format('MM/DD/YYYY') : null} />
      <F lbl="Evaluation Notes" val={record.evaluationNotes} />
      <F lbl="Deficiencies Found" val={record.deficienciesFound} />
      <F lbl="Corrective Actions Taken" val={record.correctiveActions} />

      {/* Signature block */}
      <div style={{ marginTop: 40, borderTop: '2px solid #000', paddingTop: 16 }}>
        <div style={row2}>
          <div style={col2}>
            <div style={{ borderBottom: '1px solid #000', height: 32 }} />
            <div style={{ ...label, marginTop: 4 }}>Program Administrator Signature</div>
          </div>
          <div style={col2}>
            <div style={{ borderBottom: '1px solid #000', height: 32 }} />
            <div style={{ ...label, marginTop: 4 }}>Date</div>
          </div>
        </div>
      </div>
    </div>
  );
}
