/* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
import { useContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import ScienceTwoToneIcon from '@mui/icons-material/ScienceTwoTone';
import { GridEnrichedColDef } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import CustomDataGrid from '../components/CustomDatagrid';
import { HazardousWasteDisposal } from '../../../models/owns/hazardousWaste';
import api from '../../../utils/api';
import { useDispatch, useSelector } from '../../../store';
import { getUsersMini } from '../../../slices/user';

const materials = ['Paint', 'Used motor oil', 'Hydraulic fluid', 'Coolant', 'Other'];
const units = ['Gallons', 'Quarts', 'Liters', 'Pounds', 'Containers'];

interface DisposalForm {
  disposalDate: string;
  material: string;
  customMaterial: string;
  amount: string;
  unit: string;
  disposedById: number | '';
  notes: string;
}

const emptyForm = (): DisposalForm => ({
  disposalDate: dayjs().format('YYYY-MM-DD'),
  material: 'Used motor oil',
  customMaterial: '',
  amount: '',
  unit: 'Gallons',
  disposedById: '',
  notes: ''
});

export default function HazardousWaste() {
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const dispatch = useDispatch();
  const { allUsersMini } = useSelector((state) => state.users);
  const [records, setRecords] = useState<HazardousWasteDisposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<HazardousWasteDisposal | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState<DisposalForm>(emptyForm());

  const loadRecords = async () => {
    setLoading(true);
    try {
      setRecords(await api.get<HazardousWasteDisposal[]>('hazardous-waste-disposals'));
    } catch {
      showSnackBar('Hazardous waste records could not be loaded.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTitle('Hazardous Waste');
    loadRecords();
    dispatch(getUsersMini(true));
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (record: HazardousWasteDisposal) => {
    setEditing(record);
    setForm({
      disposalDate: record.disposalDate,
      material: materials.includes(record.material) ? record.material : 'Other',
      customMaterial: materials.includes(record.material) ? '' : record.material,
      amount: String(record.amount),
      unit: record.unit,
      disposedById: record.disposedBy?.id || '',
      notes: record.notes || ''
    });
    setDialogOpen(true);
  };

  const save = async () => {
    const amount = Number(form.amount);
    const material = form.material === 'Other' ? form.customMaterial.trim() : form.material;
    if (!form.disposalDate || !material || !form.unit || !form.disposedById || !Number.isFinite(amount) || amount <= 0) {
      showSnackBar('Enter a date, material, amount, and who disposed of it.', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      disposalDate: form.disposalDate,
      material,
      amount,
      unit: form.unit,
      disposedBy: { id: form.disposedById },
      notes: form.notes.trim() || null
    };
    try {
      const saved = editing
        ? await api.patch<HazardousWasteDisposal>(`hazardous-waste-disposals/${editing.id}`, payload)
        : await api.post<HazardousWasteDisposal>('hazardous-waste-disposals', payload);
      setRecords((current) => {
        const next = editing ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current];
        return next.sort((a, b) => b.disposalDate.localeCompare(a.disposalDate));
      });
      setDialogOpen(false);
      showSnackBar(editing ? 'Disposal record updated.' : 'Disposal record saved.', 'success');
    } catch {
      showSnackBar('The disposal record could not be saved.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (deleteId === null) return;
    try {
      await api.deletes(`hazardous-waste-disposals/${deleteId}`);
      setRecords((current) => current.filter((item) => item.id !== deleteId));
      setDeleteId(null);
      showSnackBar('Disposal record deleted.', 'success');
    } catch {
      showSnackBar('The disposal record could not be deleted.', 'error');
    }
  };

  const totalEntries = records.length;
  const currentYearEntries = useMemo(
    () => records.filter((record) => dayjs(record.disposalDate).year() === dayjs().year()).length,
    [records]
  );
  const yearlyGallonTotals = useMemo(() => {
    const totals = new Map<string, number>();
    records
      .filter(
        (record) =>
          dayjs(record.disposalDate).year() === dayjs().year() &&
          record.unit.toLowerCase() === 'gallons'
      )
      .forEach((record) => {
        totals.set(record.material, (totals.get(record.material) || 0) + Number(record.amount));
      });
    return Array.from(totals.entries())
      .map(([material, gallons]) => ({ material, gallons }))
      .sort((a, b) => a.material.localeCompare(b.material));
  }, [records]);

  const formatGallons = (gallons: number) =>
    gallons.toLocaleString(undefined, { maximumFractionDigits: 2 });

  const columns: GridEnrichedColDef[] = [
    {
      field: 'disposalDate',
      headerName: 'Date',
      width: 130,
      valueFormatter: (params) => dayjs(params.value).format('MM/DD/YYYY')
    },
    { field: 'material', headerName: 'Material', minWidth: 190, flex: 1 },
    {
      field: 'amount',
      headerName: 'Amount',
      minWidth: 160,
      valueGetter: (params) => `${params.row.amount} ${params.row.unit}`
    },
    {
      field: 'disposedBy',
      headerName: 'Disposed by',
      minWidth: 180,
      valueGetter: (params) => params.row.disposedBy
        ? `${params.row.disposedBy.firstName} ${params.row.disposedBy.lastName}`.trim()
        : '—'
    },
    { field: 'notes', headerName: 'Notes', minWidth: 260, flex: 1, valueFormatter: (params) => params.value || '—' },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 110,
      getActions: (params) => [
        <Tooltip title="Edit record" key="edit">
          <IconButton aria-label="Edit disposal record" size="small" onClick={() => openEdit(params.row)}>
            <EditTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>,
        <Tooltip title="Delete record" key="delete">
          <IconButton aria-label="Delete disposal record" size="small" color="error" onClick={() => setDeleteId(params.row.id)}>
            <DeleteTwoToneIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ]
    }
  ];

  return (
    <Box p={{ xs: 1.5, md: 2 }} sx={{ minWidth: 0 }}>
      <Paper
        sx={{
          bgcolor: 'primary.dark',
          color: 'primary.contrastText',
          borderLeft: '5px solid',
          borderColor: 'secondary.main',
          p: { xs: 2, md: 2.5 },
          mb: 2
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <ScienceTwoToneIcon sx={{ fontSize: 38, color: 'secondary.light' }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                Hazardous Waste Log
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                Record what was disposed, how much, and when it left the facility.
              </Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              component="a"
              href="https://www.skagitcounty.net/Departments/PublicWorksSolidWaste/hhw.htm"
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              startIcon={<OpenInNewTwoToneIcon />}
              sx={{ color: 'primary.contrastText', borderColor: 'primary.contrastText', whiteSpace: 'nowrap' }}
            >
              Disposal information
            </Button>
            <Button variant="contained" color="secondary" startIcon={<AddTwoToneIcon />} onClick={openAdd} sx={{ whiteSpace: 'nowrap' }}>
              Log disposal
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box mb={1}>
        <Typography variant="h6">{dayjs().year()} gallons disposed</Typography>
        <Typography variant="body2" color="text.secondary">
          Year-to-date totals by hazardous material
        </Typography>
      </Box>
      <Grid container spacing={1.5} mb={2}>
        {yearlyGallonTotals.map(({ material, gallons }) => (
          <Grid item xs={12} sm={6} md={3} key={material}>
            <Paper variant="outlined" sx={{ p: 1.5, borderTop: '3px solid', borderTopColor: 'secondary.main' }}>
              <Typography variant="caption" color="text.secondary">{material}</Typography>
              <Typography variant="h5" fontWeight={700}>{formatGallons(gallons)} gal</Typography>
            </Paper>
          </Grid>
        ))}
        {yearlyGallonTotals.length === 0 && (
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 1.5 }}>
              <Typography color="text.secondary">No gallon-based disposal records have been logged this year.</Typography>
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">All disposal records</Typography>
            <Typography variant="h5" fontWeight={700}>{totalEntries}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">Records this year</Typography>
            <Typography variant="h5" fontWeight={700}>{currentYearEntries}</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Box px={2} py={1.5}>
          <Typography variant="h6">Disposal history</Typography>
          <Typography variant="body2" color="text.secondary">Newest disposal dates appear first. Past dates can be entered at any time.</Typography>
        </Box>
        <CustomDataGrid
          storageKey="hazardous_waste_disposals"
          rows={records}
          columns={columns}
          loading={loading}
          autoHeight
          disableSelectionOnClick
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ border: 0 }}
        />
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit disposal record' : 'Log hazardous waste disposal'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} pt={0.5}>
            <Grid item xs={12} sm={6}>
              <TextField label="Disposal date" type="date" value={form.disposalDate} onChange={(event) => setForm({ ...form, disposalDate: event.target.value })} fullWidth required InputLabelProps={{ shrink: true }} helperText="Past dates are allowed" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Material</InputLabel>
                <Select value={form.material} label="Material" onChange={(event) => setForm({ ...form, material: event.target.value })}>
                  {materials.map((material) => <MenuItem key={material} value={material}>{material}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {form.material === 'Other' && (
              <Grid item xs={12}>
                <TextField label="Material name" value={form.customMaterial} onChange={(event) => setForm({ ...form, customMaterial: event.target.value })} fullWidth required autoFocus />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField label="Amount" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} inputProps={{ min: 0.01, step: 0.01 }} fullWidth required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select value={form.unit} label="Unit" onChange={(event) => setForm({ ...form, unit: event.target.value })}>
                  {units.map((unit) => <MenuItem key={unit} value={unit}>{unit}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Disposed by</InputLabel>
                <Select
                  value={form.disposedById}
                  label="Disposed by"
                  onChange={(event) => setForm({ ...form, disposedById: event.target.value as number })}
                >
                  {allUsersMini.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Notes (optional)" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} multiline rows={3} fullWidth placeholder="Example: five-gallon containers delivered to the disposal facility" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save record'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete disposal record?</DialogTitle>
        <DialogContent><Typography>This permanently removes the selected record.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={remove}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
