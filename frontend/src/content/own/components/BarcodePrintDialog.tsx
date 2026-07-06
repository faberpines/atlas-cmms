import * as React from 'react';
import { useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import Barcode from 'react-barcode';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';

interface Props {
  open: boolean;
  onClose: () => void;
  value: string;
  label: string;
  sublabel?: string;
}

export default function BarcodePrintDialog({
  open,
  onClose,
  value,
  label,
  sublabel
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=400,height=300');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode - ${label}</title>
          <style>
            body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: sans-serif; }
            .label-wrap { text-align: center; padding: 12px; border: 1px solid #ccc; border-radius: 6px; display: inline-block; }
            .label-name { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
            .label-sub { font-size: 11px; color: #555; margin-top: 4px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  // Validate value is non-empty and printable for Code128
  const safeValue = value && value.trim() ? value.trim() : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Print Barcode</DialogTitle>
      <DialogContent>
        {safeValue ? (
          <Stack spacing={2} alignItems="center">
            <Box
              ref={printRef}
              className="label-wrap"
              sx={{ textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}
            >
              <div className="label-name">{label}</div>
              <Barcode
                value={safeValue}
                format="CODE128"
                width={1.8}
                height={60}
                fontSize={12}
                margin={4}
              />
              {sublabel && <div className="label-sub">{sublabel}</div>}
            </Box>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                startIcon={<PrintTwoToneIcon />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button onClick={onClose}>Close</Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography color="text.secondary">
              No barcode value available for this item. Please set a barcode or custom ID first.
            </Typography>
            <Button onClick={onClose}>Close</Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
