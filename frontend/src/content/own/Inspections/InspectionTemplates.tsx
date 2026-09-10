import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
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
import { useContext, useEffect, useState } from 'react';
import { useDispatch } from '../../../store';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import {
  GridActionsCellItem,
  GridEnrichedColDef,
  GridRenderCellParams,
  GridRowParams,
  GridToolbar
} from '@mui/x-data-grid';
import CustomDataGrid from '../components/CustomDatagrid';
import {
  createTemplate,
  deleteTemplate,
  editTemplate
} from '../../../slices/inspection';
import { Inspection, InspectionTemplate, InspectionTemplateItem, InspectionItemType } from '../../../models/owns/inspection';
import ConfirmDialog from '../components/ConfirmDialog';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';

const ITEM_TYPES: { value: InspectionItemType; label: string }[] = [
  { value: 'PASS_FAIL', label: 'Pass/Fail' },
  { value: 'TEXT', label: 'Text' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'CHECKBOX', label: 'Checkbox' },
  { value: 'DATE', label: 'Date' }
];

const CATEGORIES = ['TRUCK', 'TRAILER', 'TRACTOR', 'FACILITY', 'OTHER'];

interface Props {
  templates: InspectionTemplate[];
  loading: boolean;
}

interface TemplateFormState {
  name: string;
  description: string;
  category: string;
  items: Partial<InspectionTemplateItem>[];
}

export default function InspectionTemplates({ templates, loading }: Props) {
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const { uploadFiles } = useContext(CompanySettingsContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InspectionTemplate | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [form, setForm] = useState<TemplateFormState>({
    name: '',
    description: '',
    category: 'TRUCK',
    items: [{ label: '', itemType: 'PASS_FAIL', required: true, displayOrder: 0 }]
  });

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      category: 'TRUCK',
      items: [{ label: '', itemType: 'PASS_FAIL', required: true, displayOrder: 0 }]
    });
    setPdfFile(null);
    setEditingTemplate(null);
  };

  const openEdit = (template: InspectionTemplate) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      description: template.description || '',
      category: template.category || 'TRUCK',
      items: template.items.map((item) => ({ ...item }))
    });
    setOpenDialog(true);
  };

  const handleAddItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          label: '',
          itemType: 'PASS_FAIL',
          required: true,
          displayOrder: prev.items.length
        }
      ]
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const handleRemoveItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showSnackBar('Template name is required', 'error');
      return;
    }
    if (form.items.some((item) => !item.label?.trim())) {
      showSnackBar('All checklist items must have a label', 'error');
      return;
    }

    let pdfTemplateId: number | undefined;
    if (pdfFile) {
      const uploaded = await uploadFiles([pdfFile] as any, [] as any);
      if (uploaded?.length) pdfTemplateId = uploaded[0].id;
    }

    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      items: form.items.map((item, idx) => ({ ...item, displayOrder: idx })),
      ...(pdfTemplateId ? { pdfTemplateId } : {})
    };

    try {
      if (editingTemplate) {
        await dispatch(editTemplate(editingTemplate.id, payload));
        showSnackBar('Template updated successfully', 'success');
      } else {
        await dispatch(createTemplate(payload));
        showSnackBar('Template created successfully', 'success');
      }
      setOpenDialog(false);
      resetForm();
    } catch (e) {
      showSnackBar('Failed to save template', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteTemplate(id));
      showSnackBar('Template deleted', 'success');
    } catch (e) {
      showSnackBar('Failed to delete template', 'error');
    }
    setConfirmDelete(null);
  };

  const columns: GridEnrichedColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'category', headerName: 'Category', width: 130 },
    {
      field: 'items',
      headerName: 'Items',
      width: 100,
      valueGetter: (params) => params.row.items?.length ?? 0
    },
    {
      field: 'pdfTemplate',
      headerName: 'PDF',
      width: 80,
      renderCell: (params: GridRenderCellParams) =>
        params.value ? (
          <Chip label="PDF" size="small" color="info" />
        ) : null
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params: GridRowParams) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditTwoToneIcon fontSize="small" />}
          label="Edit"
          onClick={() => openEdit(params.row as InspectionTemplate)}
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
          <Typography variant="h5">Inspection Templates</Typography>
          <Button
            startIcon={<AddTwoToneIcon />}
            variant="contained"
            onClick={() => {
              resetForm();
              setOpenDialog(true);
            }}
          >
            New Template
          </Button>
        </Box>
        <CustomDataGrid
          storageKey="inspection_templates"
          rows={templates}
          columns={columns}
          loading={loading}
          autoHeight
          components={{ Toolbar: GridToolbar }}
          disableSelectionOnClick
        />
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => { setOpenDialog(false); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Inspection Template'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Template Name *"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.category}
                label="Category"
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                PDF Template (optional)
              </Typography>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              />
              {pdfFile && (
                <Typography variant="caption">{pdfFile.name}</Typography>
              )}
            </Box>

            <Typography variant="subtitle1">Checklist Items</Typography>
            {form.items.map((item, idx) => (
              <Box key={idx} display="flex" gap={1} alignItems="center">
                <TextField
                  label={`Item ${idx + 1}`}
                  value={item.label || ''}
                  onChange={(e) => handleItemChange(idx, 'label', e.target.value)}
                  size="small"
                  sx={{ flex: 2 }}
                />
                <FormControl size="small" sx={{ flex: 1 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={item.itemType || 'PASS_FAIL'}
                    label="Type"
                    onChange={(e) => handleItemChange(idx, 'itemType', e.target.value)}
                  >
                    {ITEM_TYPES.map((t) => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <IconButton size="small" onClick={() => handleRemoveItem(idx)}>
                  <DeleteTwoToneIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button variant="outlined" onClick={handleAddItem} startIcon={<AddTwoToneIcon />}>
              Add Item
            </Button>

            <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
              <Button onClick={() => { setOpenDialog(false); resetForm(); }}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit}>
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete !== null}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        confirmText="Delete"
        question="Are you sure you want to delete this template?"
      />
    </Box>
  );
}
