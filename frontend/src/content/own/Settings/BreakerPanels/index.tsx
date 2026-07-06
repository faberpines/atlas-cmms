import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ElectricalServicesTwoToneIcon from '@mui/icons-material/ElectricalServicesTwoTone';
import { useDispatch, useSelector } from '../../../../store';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import {
  getPanels,
  createPanel,
  updatePanel,
  deletePanel,
  createBreaker,
  updateBreaker,
  deleteBreaker
} from '../../../../slices/breakerPanel';
import { BreakerPanel, Breaker } from '../../../../models/owns/breakerPanel';

function BreakerPanelSettings() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { panels, loadingGet } = useSelector((state) => state.breakerPanels);

  // Panel dialog state
  const [panelDialogOpen, setPanelDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<BreakerPanel | null>(null);
  const [panelForm, setPanelForm] = useState({ name: '', location: '', notes: '' });

  // Breaker dialog state
  const [breakerDialogOpen, setBreakerDialogOpen] = useState(false);
  const [editingBreaker, setEditingBreaker] = useState<Breaker | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<number | null>(null);
  const [breakerForm, setBreakerForm] = useState({
    label: '',
    circuitNumber: '',
    amperage: '',
    description: ''
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(getPanels());
  }, []);

  /* ─── Panel handlers ─── */
  const openAddPanel = () => {
    setEditingPanel(null);
    setPanelForm({ name: '', location: '', notes: '' });
    setPanelDialogOpen(true);
  };

  const openEditPanel = (panel: BreakerPanel) => {
    setEditingPanel(panel);
    setPanelForm({
      name: panel.name,
      location: panel.location ?? '',
      notes: panel.notes ?? ''
    });
    setPanelDialogOpen(true);
  };

  const handleSavePanel = async () => {
    if (!panelForm.name.trim()) {
      showSnackBar(t('panel_name_required'), 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: panelForm.name,
        location: panelForm.location || null,
        notes: panelForm.notes || null
      };
      if (editingPanel) {
        await dispatch(updatePanel(editingPanel.id, payload));
        showSnackBar(t('panel_updated'), 'success');
      } else {
        await dispatch(createPanel(payload));
        showSnackBar(t('panel_created'), 'success');
      }
      setPanelDialogOpen(false);
    } catch {
      showSnackBar(t('something_went_wrong'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePanel = async (id: number) => {
    if (window.confirm(t('panel_delete_confirm'))) {
      await dispatch(deletePanel(id));
      showSnackBar(t('deleted_successfully'), 'success');
    }
  };

  /* ─── Breaker handlers ─── */
  const openAddBreaker = (panelId: number) => {
    setEditingBreaker(null);
    setSelectedPanelId(panelId);
    setBreakerForm({ label: '', circuitNumber: '', amperage: '', description: '' });
    setBreakerDialogOpen(true);
  };

  const openEditBreaker = (breaker: Breaker) => {
    setEditingBreaker(breaker);
    setSelectedPanelId(breaker.panel.id);
    setBreakerForm({
      label: breaker.label,
      circuitNumber: breaker.circuitNumber ?? '',
      amperage: breaker.amperage != null ? String(breaker.amperage) : '',
      description: breaker.description ?? ''
    });
    setBreakerDialogOpen(true);
  };

  const handleSaveBreaker = async () => {
    if (!breakerForm.label.trim()) {
      showSnackBar(t('breaker_label_required'), 'error');
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Breaker> = {
        label: breakerForm.label,
        circuitNumber: breakerForm.circuitNumber || null,
        amperage: breakerForm.amperage ? parseInt(breakerForm.amperage) : null,
        description: breakerForm.description || null
      };
      if (editingBreaker) {
        await dispatch(updateBreaker(editingBreaker.id, payload));
        showSnackBar(t('breaker_updated'), 'success');
      } else {
        await dispatch(createBreaker(selectedPanelId!, payload));
        showSnackBar(t('breaker_created'), 'success');
      }
      setBreakerDialogOpen(false);
      // Refresh panels to get updated breakers
      dispatch(getPanels());
    } catch {
      showSnackBar(t('something_went_wrong'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBreaker = async (id: number) => {
    if (window.confirm(t('breaker_delete_confirm'))) {
      await dispatch(deleteBreaker(id));
      showSnackBar(t('deleted_successfully'), 'success');
    }
  };

  // Get breakers for a panel from the redux store
  const getBreakersForPanel = (panelId: number) => {
    // We need to fetch per-panel breakers; use the panels list
    return [];
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ElectricalServicesTwoToneIcon color="primary" />
          <Box>
            <Typography variant="h5">{t('breaker_panels')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('breaker_panels_subtitle')}
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddTwoToneIcon />}
          onClick={openAddPanel}
        >
          {t('add_panel')}
        </Button>
      </Stack>

      {panels.length === 0 && !loadingGet && (
        <Box
          p={4}
          textAlign="center"
          sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}
        >
          <ElectricalServicesTwoToneIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">{t('no_panels_yet')}</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={openAddPanel} startIcon={<AddTwoToneIcon />}>
            {t('add_your_first_panel')}
          </Button>
        </Box>
      )}

      {panels.map((panel) => (
        <PanelAccordion
          key={panel.id}
          panel={panel}
          onEditPanel={openEditPanel}
          onDeletePanel={handleDeletePanel}
          onAddBreaker={openAddBreaker}
          onEditBreaker={openEditBreaker}
          onDeleteBreaker={handleDeleteBreaker}
          t={t}
        />
      ))}

      {/* Panel Dialog */}
      <Dialog open={panelDialogOpen} onClose={() => setPanelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPanel ? t('edit_panel') : t('add_panel')}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={0}>
            <Grid item xs={12}>
              <TextField
                label={t('panel_name')}
                value={panelForm.name}
                onChange={(e) => setPanelForm({ ...panelForm, name: e.target.value })}
                fullWidth
                required
                placeholder={t('panel_name_placeholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('panel_location')}
                value={panelForm.location}
                onChange={(e) => setPanelForm({ ...panelForm, location: e.target.value })}
                fullWidth
                placeholder={t('panel_location_placeholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('notes')}
                value={panelForm.notes}
                onChange={(e) => setPanelForm({ ...panelForm, notes: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPanelDialogOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSavePanel} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Breaker Dialog */}
      <Dialog open={breakerDialogOpen} onClose={() => setBreakerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingBreaker ? t('edit_breaker') : t('add_breaker')}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={0}>
            <Grid item xs={12} sm={8}>
              <TextField
                label={t('breaker_label')}
                value={breakerForm.label}
                onChange={(e) => setBreakerForm({ ...breakerForm, label: e.target.value })}
                fullWidth
                required
                placeholder={t('breaker_label_placeholder')}
                helperText={t('breaker_label_hint')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={t('circuit_number')}
                value={breakerForm.circuitNumber}
                onChange={(e) => setBreakerForm({ ...breakerForm, circuitNumber: e.target.value })}
                fullWidth
                placeholder="1, 2A, ..."
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label={`${t('amperage')} (A)`}
                value={breakerForm.amperage}
                onChange={(e) => setBreakerForm({ ...breakerForm, amperage: e.target.value })}
                fullWidth
                type="number"
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                label={t('breaker_description')}
                value={breakerForm.description}
                onChange={(e) => setBreakerForm({ ...breakerForm, description: e.target.value })}
                fullWidth
                placeholder={t('breaker_description_placeholder')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreakerDialogOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSaveBreaker} disabled={saving}>
            {saving ? t('saving') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ─── Panel Accordion sub-component ─── */
interface PanelAccordionProps {
  panel: BreakerPanel;
  onEditPanel: (p: BreakerPanel) => void;
  onDeletePanel: (id: number) => void;
  onAddBreaker: (panelId: number) => void;
  onEditBreaker: (b: Breaker) => void;
  onDeleteBreaker: (id: number) => void;
  t: any;
}

function PanelAccordion({
  panel,
  onEditPanel,
  onDeletePanel,
  onAddBreaker,
  onEditBreaker,
  onDeleteBreaker,
  t
}: PanelAccordionProps) {
  const { breakers } = useSelector((state) => state.breakerPanels);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const [breakersLoaded, setBreakersLoaded] = useState(false);
  const panelBreakers = breakers.filter((b) => b.panel?.id === panel.id);

  const handleExpand = () => {
    if (!expanded && !breakersLoaded) {
      // Fetch breakers for this panel when first expanded
      import('../../../../slices/breakerPanel').then(({ getAllBreakers }) => {
        dispatch(getAllBreakers());
      });
      setBreakersLoaded(true);
    }
    setExpanded(!expanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleExpand} sx={{ mb: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ElectricalServicesTwoToneIcon fontSize="small" color="primary" />
            <Box>
              <Typography fontWeight={600}>{panel.name}</Typography>
              {panel.location && (
                <Typography variant="caption" color="text.secondary">
                  📍 {panel.location}
                </Typography>
              )}
            </Box>
          </Stack>
          <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
            <Tooltip title={t('edit')}>
              <IconButton size="small" onClick={() => onEditPanel(panel)}>
                <EditTwoToneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('delete')}>
              <IconButton size="small" color="error" onClick={() => onDeletePanel(panel.id)}>
                <DeleteTwoToneIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {panel.notes && (
          <Typography variant="body2" color="text.secondary" mb={1.5}>
            {panel.notes}
          </Typography>
        )}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle2">{t('breakers')} ({panelBreakers.length})</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddTwoToneIcon />}
            onClick={() => onAddBreaker(panel.id)}
          >
            {t('add_breaker')}
          </Button>
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        {panelBreakers.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={1}>
            {t('no_breakers_in_panel')}
          </Typography>
        ) : (
          <Grid container spacing={1}>
            {panelBreakers.map((b) => (
              <Grid item xs={12} sm={6} md={4} key={b.id}>
                <Box
                  p={1.5}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {b.label}
                      </Typography>
                      {(b.circuitNumber || b.amperage) && (
                        <Typography variant="caption" color="text.secondary">
                          {b.circuitNumber && `#${b.circuitNumber}`}
                          {b.circuitNumber && b.amperage && ' • '}
                          {b.amperage && `${b.amperage}A`}
                        </Typography>
                      )}
                      {b.description && (
                        <Typography variant="caption" display="block" color="text.secondary" noWrap>
                          {b.description}
                        </Typography>
                      )}
                    </Box>
                    <Stack direction="row">
                      <IconButton size="small" onClick={() => onEditBreaker(b)}>
                        <EditTwoToneIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => onDeleteBreaker(b.id)}>
                        <DeleteTwoToneIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default BreakerPanelSettings;
