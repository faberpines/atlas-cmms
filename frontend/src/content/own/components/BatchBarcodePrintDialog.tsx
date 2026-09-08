import * as React from 'react';
import { useRef } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material';
import PrintTwoToneIcon from '@mui/icons-material/PrintTwoTone';
import Barcode from 'react-barcode';
import { AssetDTO } from '../../../models/owns/asset';

interface Props {
  open: boolean;
  onClose: () => void;
  assets: AssetDTO[];
}

export default function BatchBarcodePrintDialog({
  open,
  onClose,
  assets
}: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Asset Barcodes</title>
          <style>
            @page { margin: 0.3in; }
            * { box-sizing: border-box; }
            body { margin: 0; color: #172713; font-family: Arial, sans-serif; }
            .barcode-sheet { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.12in; }
            .barcode-label { min-width: 0; height: 1.25in; border: 1px solid #aebfaa; padding: 0.08in; display: flex; flex-direction: column; align-items: center; justify-content: center; break-inside: avoid; overflow: hidden; }
            .asset-name { width: 100%; font-size: 10pt; font-weight: 700; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .asset-section { margin-top: 2px; color: #52634b; font-size: 7pt; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
            svg { max-width: 100%; height: 58px; }
          </style>
        </head>
        <body>${printRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Print all asset barcodes</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            {assets.length} printable barcode label
            {assets.length === 1 ? '' : 's'} will be arranged three across.
          </Typography>
          <Box
            ref={printRef}
            className="barcode-sheet"
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))'
              },
              gap: 1.5
            }}
          >
            {assets.map((asset) => (
              <Box
                key={asset.id}
                className="barcode-label"
                sx={{
                  minWidth: 0,
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1.25,
                  textAlign: 'center',
                  overflow: 'hidden'
                }}
              >
                <div className="asset-name">{asset.name}</div>
                <Barcode
                  value={asset.barCode.trim()}
                  format="CODE128"
                  width={1.45}
                  height={48}
                  fontSize={11}
                  margin={3}
                />
                <div className="asset-section">
                  {asset.equipmentType?.replaceAll('_', ' ')}
                </div>
              </Box>
            ))}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          startIcon={<PrintTwoToneIcon />}
          onClick={handlePrint}
          disabled={!assets.length}
        >
          Print {assets.length} labels
        </Button>
      </DialogActions>
    </Dialog>
  );
}
