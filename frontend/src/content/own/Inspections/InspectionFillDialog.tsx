import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import * as React from 'react';
import { useState } from 'react';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import {
  Inspection,
  InspectionItemResult,
  InspectionItemType,
  InspectionStatus
} from '../../../models/owns/inspection';

interface Props {
  inspection: Inspection;
  open: boolean;
  onClose: () => void;
  onSave: (
    id: number,
    results: Partial<InspectionItemResult>[],
    status: InspectionStatus,
    notes: string,
    pdfFile?: File,
    clearPdf?: boolean
  ) => Promise<void>;
}

const STATUS_OPTIONS: InspectionStatus[] = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED'
];

export default function InspectionFillDialog({ inspection, open, onClose, onSave }: Props) {
  // Build initial results map keyed by item id
  const buildInitial = () => {
    const map: Record<number, Partial<InspectionItemResult>> = {};
    inspection.template.items.forEach((item) => {
      const existing = inspection.results?.find((r) => r.item?.id === item.id);
      map[item.id] = existing
        ? { ...existing }
        : { item, value: '', passed: undefined, notes: '' };
    });
    return map;
  };

  const [results, setResults] = useState<Record<number, Partial<InspectionItemResult>>>(buildInitial);
  const [status, setStatus] = useState<InspectionStatus>(inspection.status);
  const [notes, setNotes] = useState(inspection.notes || '');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [clearPdf, setClearPdf] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateResult = (itemId: number, field: keyof InspectionItemResult, value: any) => {
    setResults((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const handlePrint = () => {
    const now = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const itemRows = inspection.template.items.map((item, idx) => {
      const r = results[item.id];
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
    }).join('');

    const html = `<!DOCTYPE html><html><head><title>Inspection Report</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 13px; margin: 20px; color: #222; }
      h1 { font-size: 18px; margin-bottom: 4px; }
      h2 { font-size: 14px; color: #555; font-weight: normal; margin: 0 0 12px; }
      .meta { display: flex; gap: 24px; margin-bottom: 16px; background: #f5f5f5; padding: 10px 12px; border-radius: 4px; }
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
    <h2>${inspection.template.name}</h2>
    <div class="meta">
      <div class="meta-item"><span class="meta-label">Asset</span><span class="meta-value">${inspection.asset?.name || '—'}</span></div>
      <div class="meta-item"><span class="meta-label">Status</span><span class="meta-value">${status.replace('_', ' ')}</span></div>
      <div class="meta-item"><span class="meta-label">Date Printed</span><span class="meta-value">${now}</span></div>
      ${inspection.completedBy ? `<div class="meta-item"><span class="meta-label">Completed By</span><span class="meta-value">${inspection.completedBy.firstName} ${inspection.completedBy.lastName}</span></div>` : ''}
    </div>
    <table>
      <thead><tr><th>#</th><th>Item</th><th style="width:100px;text-align:center;">Result</th></tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    ${notes ? `<div class="notes"><strong>Overall Notes:</strong><br>${notes}</div>` : ''}
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

  const handleSave = async () => {
    setSaving(true);
    const resultList = Object.values(results).map((r) => ({
      itemId: r.item?.id,
      value: r.value,
      passed: r.passed,
      notes: r.notes
    }));
    await onSave(inspection.id, resultList as any, status, notes, pdfFile || undefined, clearPdf);
    setSaving(false);
  };

  const renderInput = (item: Inspection['template']['items'][0]) => {
    const result = results[item.id];
    switch (item.itemType as InspectionItemType) {
      case 'PASS_FAIL':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={result?.passed === true ? 'pass' : result?.passed === false ? 'fail' : ''}
              onChange={(e) =>
                updateResult(item.id, 'passed', e.target.value === 'pass')
              }
            >
              <FormControlLabel value="pass" control={<Radio color="success" />} label="Pass" />
              <FormControlLabel value="fail" control={<Radio color="error" />} label="Fail" />
            </RadioGroup>
          </FormControl>
        );
      case 'CHECKBOX':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={result?.value === 'true'}
                onChange={(e) => updateResult(item.id, 'value', String(e.target.checked))}
              />
            }
            label="Checked"
          />
        );
      case 'NUMBER':
        return (
          <TextField
            type="number"
            size="small"
            value={result?.value || ''}
            onChange={(e) => updateResult(item.id, 'value', e.target.value)}
          />
        );
      case 'DATE':
        return (
          <TextField
            type="date"
            size="small"
            InputLabelProps={{ shrink: true }}
            value={result?.value || ''}
            onChange={(e) => updateResult(item.id, 'value', e.target.value)}
          />
        );
      case 'TEXT':
      default:
        return (
          <TextField
            size="small"
            multiline
            minRows={1}
            value={result?.value || ''}
            onChange={(e) => updateResult(item.id, 'value', e.target.value)}
            fullWidth
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {inspection.template.name}
        {inspection.asset ? ` — ${inspection.asset.name}` : ''}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Status */}
          <FormControl size="small" sx={{ maxWidth: 200 }}>
            <FormLabel>Status</FormLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as InspectionStatus)}
              size="small"
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          {/* Checklist Items */}
          {inspection.template.items.map((item, idx) => (
            <Box key={item.id}>
              <Typography variant="subtitle2" gutterBottom>
                {idx + 1}. {item.label}
                {item.required && <span style={{ color: 'red' }}> *</span>}
                {item.description && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    {item.description}
                  </Typography>
                )}
              </Typography>
              {renderInput(item)}
              <TextField
                label="Notes"
                size="small"
                value={results[item.id]?.notes || ''}
                onChange={(e) => updateResult(item.id, 'notes', e.target.value)}
                sx={{ mt: 1 }}
                fullWidth
              />
            </Box>
          ))}

          <Divider />

          {/* Overall Notes */}
          <TextField
            label="Overall Notes"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />

          {/* Completed PDF Upload */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>Upload Completed PDF (optional)</Typography>
            {inspection.completedPdf && !pdfFile && !clearPdf && (
              <Box mb={1} display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="text.secondary">Currently attached:</Typography>
                <a href={inspection.completedPdf.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13 }}>
                  {inspection.completedPdf.name}
                </a>
                <Tooltip title="Remove attached PDF">
                  <IconButton size="small" color="error" onClick={() => setClearPdf(true)}>
                    <DeleteTwoToneIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {clearPdf && (
              <Box mb={1} display="flex" alignItems="center" gap={1}>
                <Typography variant="caption" color="error">Attached PDF will be removed on save.</Typography>
                <Button size="small" onClick={() => setClearPdf(false)}>Undo</Button>
              </Box>
            )}
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => { setPdfFile(e.target.files?.[0] || null); setClearPdf(false); }}
            />
            {pdfFile && <Typography variant="caption">{pdfFile.name} (replaces current)</Typography>}
          </Box>

          {/* Actions */}
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              startIcon={<PrintTwoToneIcon />}
              onClick={handlePrint}
            >
              Print
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
