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
      </Box>
    </LocalizationProvider>
  );
}
