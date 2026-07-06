import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import QrCodeScannerTwoToneIcon from '@mui/icons-material/DocumentScannerTwoTone';
import api from '../../../utils/api';
import Part from '../../../models/owns/part';
import { Page } from '../../../models/owns/page';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called when a part is found by barcode scan */
  onPartFound: (part: Part) => void;
  /** Called when scanned barcode doesn't match any part */
  onPartNotFound: (barcode: string) => void;
}

export default function BarcodeScanDialog({
  open,
  onClose,
  onPartFound,
  onPartNotFound
}: Props) {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
  const [foundPart, setFoundPart] = useState<Part | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (open) {
      setInputValue('');
      setStatus('idle');
      setFoundPart(null);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleScan = async (barcode: string) => {
    if (!barcode.trim()) return;
    setLoading(true);
    setStatus('idle');
    try {
      const result = await api.post<Page<Part>>('parts/search', {
        filterFields: [{ field: 'barcode', value: barcode.trim(), operation: 'eq' }],
        pageSize: 1,
        pageNum: 0
      });
      if (result.content && result.content.length > 0) {
        setFoundPart(result.content[0]);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('not_found');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScan(inputValue);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <QrCodeScannerTwoToneIcon />
          <span>Scan Part Barcode</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2" color="text.secondary">
            Point your barcode scanner at a part label and scan. The scanner will automatically submit the barcode.
          </Typography>
          <TextField
            inputRef={inputRef}
            label="Barcode"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            fullWidth
            autoComplete="off"
            placeholder="Scan or type barcode, then press Enter"
            InputProps={{
              endAdornment: loading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null
            }}
          />

          {status === 'found' && foundPart && (
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'success.main',
                borderRadius: 1,
                bgcolor: 'success.lighter'
              }}
            >
              <Typography variant="subtitle2" color="success.dark">
                ✓ Part Found
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {foundPart.name}
              </Typography>
              {foundPart.barcode && (
                <Typography variant="body2" color="text.secondary">
                  Barcode: {foundPart.barcode}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                Qty: {foundPart.quantity ?? 0} {foundPart.unit || ''}
              </Typography>
              <Stack direction="row" spacing={1} mt={1.5}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    onPartFound(foundPart);
                    onClose();
                  }}
                >
                  View Part
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setInputValue('');
                    setStatus('idle');
                    setFoundPart(null);
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                >
                  Scan Another
                </Button>
              </Stack>
            </Box>
          )}

          {status === 'not_found' && (
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'warning.main',
                borderRadius: 1,
                bgcolor: 'warning.lighter'
              }}
            >
              <Typography variant="subtitle2" color="warning.dark">
                No part found for barcode: <strong>{inputValue}</strong>
              </Typography>
              <Stack direction="row" spacing={1} mt={1.5}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    onPartNotFound(inputValue);
                    onClose();
                  }}
                >
                  Create New Part
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setInputValue('');
                    setStatus('idle');
                    setTimeout(() => inputRef.current?.focus(), 50);
                  }}
                >
                  Scan Again
                </Button>
              </Stack>
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end">
            <Button onClick={onClose}>Cancel</Button>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
