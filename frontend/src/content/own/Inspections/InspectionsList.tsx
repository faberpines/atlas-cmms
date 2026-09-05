import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as React from 'react';
import { useContext, useState } from 'react';
import { useDispatch } from '../../../store';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import {
  DataGrid,
  GridActionsCellItem,
  GridEnrichedColDef,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar
} from '@mui/x-data-grid';
import { createInspection, deleteInspection, editInspection } from '../../../slices/inspection';
import { addFilesToWorkOrder } from '../../../slices/workOrder';
import {
  Inspection,
  InspectionItemResult,
  InspectionStatus,
  InspectionTemplate
} from '../../../models/owns/inspection';
import { AssetMiniDTO } from '../../../models/owns/asset';
import ConfirmDialog from '../components/ConfirmDialog';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import InspectionFillDialog from './InspectionFillDialog';

const STATUS_COLORS: Record<InspectionStatus, 'default' | 'info' | 'success' | 'error'> = {
  PENDING: 'default',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  FAILED: 'error'
};

interface Props {
  inspections: Inspection[];
  templates: InspectionTemplate[];
  assets: AssetMiniDTO[];
  loading: boolean;
  // Optional: pre-filter to specific WO or PM
  workOrderId?: number;
  pmId?: number;
}

export default function InspectionsList({
  inspections,
  templates,
  assets,
  loading,
  workOrderId,
  pmId
}: Props) {
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [fillInspection, setFillInspection] = useState<Inspection | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [newForm, setNewForm] = useState({ templateId: '', assetId: '', notes: '' });

  const filteredInspections = inspections.filter((i) => {
    if (workOrderId) return i.workOrder?.id === workOrderId;
    if (pmId) return i.preventiveMaintenance?.id === pmId;
    return true;
  });

  const handleCreate = async () => {
    if (!newForm.templateId) {
      showSnackBar('Please select a template', 'error');
      return;
    }
    if (!newForm.assetId) {
      showSnackBar('Please select an asset', 'error');
      return;
    }
    try {
      await dispatch(
        createInspection({
          templateId: Number(newForm.templateId),
          assetId: Number(newForm.assetId),
          notes: newForm.notes,
          ...(workOrderId ? { workOrderId } : {}),
          ...(pmId ? { preventiveMaintenanceId: pmId } : {})
        })
      );
      showSnackBar('Inspection created', 'success');
      setOpenNewDialog(false);
      setNewForm({ templateId: '', assetId: '', notes: '' });
    } catch (e) {
      showSnackBar('Failed to create inspection', 'error');
    }
  };

  const handleSaveResults = async (
    id: number,
    results: Partial<InspectionItemResult>[],
    status: InspectionStatus,
    notes: string,
    pdfFile?: globalThis.File,
    clearPdf?: boolean
  ) => {
    let completedPdfId: number | undefined;
    if (pdfFile) {
      // Upload as hidden so the file doesn't pollute the global Files list
      const uploaded = await uploadFiles([pdfFile] as any, [] as any, true);
      if (uploaded?.length) {
        completedPdfId = uploaded[0].id;
        // Also attach the PDF to the linked work order so it appears under the WO's Files tab
        if (workOrderId) {
          dispatch(addFilesToWorkOrder(workOrderId, [{ id: completedPdfId }]));
        }
      }
    }
    try {
      await dispatch(
        editInspection(id, {
          status,
          notes,
          results,
          ...(completedPdfId ? { completedPdfId } : {}),
          ...(clearPdf && !completedPdfId ? { clearCompletedPdf: true } : {})
        })
      );
      showSnackBar('Inspection saved', 'success');
      setFillInspection(null);
    } catch (e) {
      showSnackBar('Failed to save inspection', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteInspection(id));
      showSnackBar('Inspection deleted', 'success');
    } catch (e) {
      showSnackBar('Failed to delete inspection', 'error');
    }
    setConfirmDelete(null);
  };

  const handlePrintInspection = (inspection: Inspection) => {
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const itemRows = inspection.template?.items?.map((item, idx) => {
      const r = inspection.results?.find((r2) => r2.item?.id === item.id);
      let resultText = '';
      if (item.itemType === 'PASS_FAIL') {
        resultText = r?.passed === true
          ? '<span style="color:green;font-weight:bold;">✓ PASS</span>'
          : r?.passed === false
          ? '<span style="color:red;font-weight:bold;">✗ FAIL</span>'
          : '<span style="color:#999;">—</span>';
      } else if (item.itemType === 'CHECKBOX') {
        resultText = r?.value === 'true' ? '☑ Yes' : '☐ No';
      } else {
        resultText = r?.value ? String(r.value) : '—';
      }
      const itemNotes = r?.notes ? `<div style="font-size:11px;color:#666;margin-top:2px;">Notes: ${r.notes}</div>` : '';
      return `<tr style="border-bottom:1px solid #eee;">
        <td style="padding:6px 8px;width:30px;color:#666;">${idx + 1}</td>
        <td style="padding:6px 8px;">
          <div>${item.label}${item.required ? ' <span style="color:red">*</span>' : ''}</div>
          ${item.description ? `<div style="font-size:11px;color:#888;">${item.description}</div>` : ''}
          ${itemNotes}
        </td>
        <td style="padding:6px 8px;text-align:center;">${resultText}</td>
      </tr>`;
    }).join('') || '';

    const html = `<!DOCTYPE html><html><head><title>Inspection Report</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; color: #222; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      h2 { font-size: 14px; color: #555; font-weight: normal; margin: 0 0 12px; }
      .meta { display: flex; gap: 24px; margin-bottom: 16px; background: #f5f5f5; padding: 10px 12px; border-radius: 4px; flex-wrap: wrap; }
      .meta-item { display: flex; flex-direction: column; }
      .meta-label { font-size: 10px; text-transform: uppercase; color: #888; }
      .meta-value { font-weight: bold; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #333; color: white; padding: 7px 8px; text-align: left; font-size: 12px; }
      .notes { margin-top: 16px; border: 1px solid #ddd; padding: 10px; border-radius: 4px; }
      .sig { margin-top: 32px; display: flex; gap: 40px; }
      .sig-line { border-top: 1px solid #333; padding-top: 4px; min-width: 200px; font-size: 11px; color: #666; }
      @media print { body { margin: 10px; } }
    </style></head><body>
    <h1>Inspection Report</h1>
    <h2>${inspection.template?.name || ''}</h2>
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Asset</span><span class="meta-value">${inspection.asset?.name || '—'}</span></div>
      <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value">${inspection.status?.replace('_', ' ') || ''}</span></div>
      <div class="meta-item"><span class="meta-label">Date Printed</span><span class="meta-value">${now}</span></div>
      ${inspection.completedAt ? `<div class="meta-item"><span class="meta-label">Completed</span><span class="meta-value">${new Date(inspection.completedAt).toLocaleDateString()}</span></div>` : ''}
      ${inspection.completedBy ? `<div class="meta-item"><span class="meta-label">Inspector</span><span class="meta-value">${inspection.completedBy.firstName} ${inspection.completedBy.lastName}</span></div>` : ''}
    </div>
    <table>
      <thead><tr><th>#</th><th>Item</th><th style="width:100px;text-align:center;">Result</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    ${inspection.notes ? `<div class="notes"><strong>Overall Notes:</strong><br>${inspection.notes}</div>` : ''}
    <div class="sig">
      <div class="sig-line">Inspector Signature</div>
      <div class="sig-line">Date</div>
    </div>
    </body></html>`;

    const win = window.open('', '_blank', 'width=800,height=900');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const columns: GridEnrichedColDef[] = [
    {
      field: 'template',
      headerName: 'Template',
      flex: 1,
      valueGetter: (params) => params.row.template?.name ?? ''
    },
    {
      field: 'asset',
      headerName: 'Asset',
      width: 140,
      valueGetter: (params) => params.row.asset?.name ?? ''
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={STATUS_COLORS[params.value as InspectionStatus]}
          size="small"
        />
      )
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 120,
      valueGetter: (params) =>
        params.row.dueDate ? new Date(params.row.dueDate).toLocaleDateString() : ''
    },
    {
      field: 'completedAt',
      headerName: 'Completed',
      width: 120,
      valueGetter: (params) =>
        params.row.completedAt ? new Date(params.row.completedAt).toLocaleDateString() : ''
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 140,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditTwoToneIcon fontSize="small" />}
          label="Fill / Edit"
          onClick={() => setFillInspection(params.row as Inspection)}
        />,
        <GridActionsCellItem
          key="print"
          icon={<PrintTwoToneIcon fontSize="small" />}
          label="Print"
          onClick={() => handlePrintInspection(params.row as Inspection)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteTwoToneIcon fontSize="small" />}
          label="Delete"
          onClick={() => setConfirmDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <Box>
      <Card>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">Inspections</Typography>
          <Button
            startIcon={<AddTwoToneIcon />}
            variant="contained"
            onClick={() => setOpenNewDialog(true)}
            disabled={!templates.length}
          >
            New Inspection
          </Button>
        </Box>
        <DataGrid
          rows={filteredInspections}
          columns={columns}
          loading={loading}
          autoHeight
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
        />
      </Card>

      {/* New Inspection Dialog */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Inspection</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Template *</InputLabel>
              <Select
                value={newForm.templateId}
                label="Template *"
                onChange={(e) => setNewForm((p) => ({ ...p, templateId: e.target.value }))}
              >
                {templates.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name} {t.category ? `(${t.category})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Asset *</InputLabel>
              <Select
                value={newForm.assetId}
                label="Asset *"
                onChange={(e) => setNewForm((p) => ({ ...p, assetId: e.target.value }))}
              >
                {assets.map((a) => (
                  <MenuItem key={a.id} value={a.id}>
                    {a.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={newForm.notes}
              onChange={(e) => setNewForm((p) => ({ ...p, notes: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <Box display="flex" justifyContent="flex-end" gap={1}>
              <Button onClick={() => setOpenNewDialog(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreate}>Create</Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Fill/Edit Inspection Dialog */}
      {fillInspection && (
        <InspectionFillDialog
          inspection={fillInspection}
          open={!!fillInspection}
          onClose={() => setFillInspection(null)}
          onSave={handleSaveResults}
        />
      )}

      <ConfirmDialog
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText="Delete"
        question="Are you sure you want to delete this inspection?"
      />
    </Box>
  );
}
