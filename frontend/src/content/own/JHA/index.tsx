import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import AssignmentTwoToneIcon from '@mui/icons-material/AssignmentTwoTone';
import UploadFileTwoToneIcon from '@mui/icons-material/UploadFileTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import OpenInNewTwoToneIcon from '@mui/icons-material/OpenInNewTwoTone';
import SearchTwoToneIcon from '@mui/icons-material/SearchTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';
import dayjs from 'dayjs';
import { TitleContext } from '../../../contexts/TitleContext';
import { CustomSnackBarContext } from 'src/contexts/CustomSnackBarContext';
import { useDispatch, useSelector } from '../../../store';
import {
  getJhaDocuments,
  deleteJhaDocument,
  updateJhaDocument
} from '../../../slices/jha';
import JhaDocument from '../../../models/owns/jha';
import api from '../../../utils/api';

export default function JHA() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { setTitle } = useContext(TitleContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const { documents, loadingGet } = useSelector((s) => s.jha);

  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [editingDoc, setEditingDoc] = useState<JhaDocument | null>(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', category: '' });
  const [editSaving, setEditSaving] = useState(false);

  // Upload dialog state
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', category: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(t('jha'));
    dispatch(getJhaDocuments());
  }, []);

  const filtered = documents.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.title?.toLowerCase().includes(q) ||
      d.category?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q) ||
      d.file?.name?.toLowerCase().includes(q)
    );
  });

  // Group by category
  const categories = Array.from(new Set(filtered.map((d) => d.category || ''))).sort();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setSelectedFile(f);
      if (!uploadForm.title) {
        // Auto-fill title from filename (strip extension)
        setUploadForm((prev) => ({ ...prev, title: f.name.replace(/\.[^.]+$/, '') }));
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadForm.title.trim()) {
      showSnackBar(t('jha_upload_required'), 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadForm.title);
      if (uploadForm.description) formData.append('description', uploadForm.description);
      if (uploadForm.category) formData.append('category', uploadForm.category);

      const result = await api.postFormData<JhaDocument>('jha', formData);
      // Manually add to store since we can't dispatch the thunk with form data easily
      dispatch({ type: 'jha/addDocument', payload: { document: result } });
      showSnackBar(t('jha_uploaded'), 'success');
      setOpenUpload(false);
      setUploadForm({ title: '', description: '', category: '' });
      setSelectedFile(null);
    } catch (e) {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteJhaDocument(id));
      showSnackBar(t('jha_deleted'), 'success');
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    }
    setConfirmDeleteId(null);
  };

  const openEdit = (doc: JhaDocument) => {
    setEditingDoc(doc);
    setEditForm({
      title: doc.title,
      description: doc.description || '',
      category: doc.category || ''
    });
  };

  const handleEditSave = async () => {
    if (!editingDoc || !editForm.title.trim()) return;
    setEditSaving(true);
    try {
      await dispatch(updateJhaDocument(editingDoc.id, {
        title: editForm.title,
        description: editForm.description || null,
        category: editForm.category || null
      }));
      showSnackBar(t('jha_updated'), 'success');
      setEditingDoc(null);
    } catch {
      showSnackBar(t('operation_failed'), 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const fileIcon = (filename?: string | null) => {
    if (!filename) return <DescriptionTwoToneIcon sx={{ fontSize: 40, color: 'primary.main' }} />;
    const ext = filename.split('.').pop()?.toLowerCase();
    const color = ext === 'pdf' ? '#e74c3c' : ext === 'docx' || ext === 'doc' ? '#2980b9' : '#7f8c8d';
    return (
      <Box sx={{
        width: 48, height: 48, borderRadius: 1,
        bgcolor: color, display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Typography sx={{ color: '#fff', fontSize: '10pt', fontWeight: 700 }}>
          {ext?.toUpperCase() ?? 'FILE'}
        </Typography>
      </Box>
    );
  };

  const DocCard = ({ doc }: { doc: JhaDocument }) => (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" alignItems="flex-start" gap={1.5} mb={1}>
          {fileIcon(doc.file?.name)}
          <Box flex={1} minWidth={0}>
            <Typography variant="subtitle2" fontWeight={700} noWrap title={doc.title}>
              {doc.title}
            </Typography>
            {doc.file && (
              <Typography variant="caption" color="text.secondary" noWrap title={doc.file.name}>
                {doc.file.name}
              </Typography>
            )}
          </Box>
        </Box>
        {doc.category && (
          <Chip label={doc.category} size="small" variant="outlined" sx={{ mb: 1, fontSize: 10 }} />
        )}
        {doc.description && (
          <Typography variant="body2" color="text.secondary" sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: '11px'
          }}>
            {doc.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.disabled" display="block" mt={1}>
          {t('uploaded')}: {dayjs(doc.createdAt).format('MM/DD/YYYY')}
        </Typography>
      </CardContent>
      <CardActions sx={{ pt: 0, px: 2, pb: 1.5, justifyContent: 'space-between' }}>
        {doc.file ? (
          <Button
            size="small"
            variant="contained"
            startIcon={<OpenInNewTwoToneIcon />}
            href={doc.file.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('open')}
          </Button>
        ) : (
          <Button size="small" disabled>{t('no_file')}</Button>
        )}
        <Box>
          <Tooltip title={t('edit')}>
            <IconButton size="small" onClick={() => openEdit(doc)}>
              <EditTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={t('delete')}>
            <IconButton size="small" color="error" onClick={() => setConfirmDeleteId(doc.id)}>
              <DeleteTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <AssignmentTwoToneIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h4">{t('jha')}</Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {t('jha_subtitle')}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<UploadFileTwoToneIcon />}
          onClick={() => setOpenUpload(true)}
        >
          {t('jha_upload')}
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        {t('jha_info')}
      </Alert>

      {/* Search */}
      <TextField
        size="small"
        placeholder={t('search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3, maxWidth: 360 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchTwoToneIcon fontSize="small" />
            </InputAdornment>
          )
        }}
      />

      {/* Documents grid */}
      {loadingGet ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Box textAlign="center" py={6}>
          <AssignmentTwoToneIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            {search ? t('no_results') : t('jha_no_documents')}
          </Typography>
          {!search && (
            <Button
              variant="outlined"
              startIcon={<UploadFileTwoToneIcon />}
              sx={{ mt: 2 }}
              onClick={() => setOpenUpload(true)}
            >
              {t('jha_upload_first')}
            </Button>
          )}
        </Box>
      ) : (
        <>
          {categories.map((cat) => {
            const catDocs = filtered.filter((d) => (d.category || '') === cat);
            if (!catDocs.length) return null;
            return (
              <Box key={cat || 'uncategorized'} mb={4}>
                {cat && (
                  <>
                    <Typography variant="h6" fontWeight={600} mb={1}>
                      {cat}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </>
                )}
                {!cat && categories.some((c) => c !== '') && (
                  <>
                    <Typography variant="h6" fontWeight={600} color="text.secondary" mb={1}>
                      {t('uncategorized')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                  </>
                )}
                <Grid container spacing={2}>
                  {catDocs.map((doc) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={doc.id}>
                      <DocCard doc={doc} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            );
          })}
        </>
      )}

      {/* Upload Dialog */}
      <Dialog open={openUpload} onClose={() => { setOpenUpload(false); setSelectedFile(null); setUploadForm({ title: '', description: '', category: '' }); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <UploadFileTwoToneIcon color="primary" />
            {t('jha_upload')}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* File picker */}
            <Grid item xs={12}>
              <Box
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: '2px dashed',
                  borderColor: selectedFile ? 'success.main' : 'divider',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: selectedFile ? 'success.lighter' : 'background.default',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <UploadFileTwoToneIcon sx={{ fontSize: 40, color: selectedFile ? 'success.main' : 'text.disabled' }} />
                <Typography variant="body2" mt={1}>
                  {selectedFile
                    ? selectedFile.name
                    : t('jha_drop_hint')}
                </Typography>
                {!selectedFile && (
                  <Typography variant="caption" color="text.secondary">
                    {t('jha_accepted_types')}
                  </Typography>
                )}
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx,.txt"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <Button size="small" color="inherit" sx={{ mt: 0.5 }} onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  {t('clear')}
                </Button>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('jha_document_title')}
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('jha_category')}
                value={uploadForm.category}
                onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                fullWidth
                placeholder={t('jha_category_placeholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('description')}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
                placeholder={t('jha_description_placeholder')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenUpload(false); setSelectedFile(null); setUploadForm({ title: '', description: '', category: '' }); }}>
            {t('cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !uploadForm.title.trim()}
            startIcon={uploading ? <CircularProgress size={16} /> : <UploadFileTwoToneIcon />}
          >
            {uploading ? t('uploading') : t('upload')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingDoc !== null} onClose={() => setEditingDoc(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('jha_edit_document')}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label={t('jha_document_title')}
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label={t('jha_category')}
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                fullWidth
                placeholder={t('jha_category_placeholder')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label={t('description')}
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingDoc(null)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleEditSave} disabled={editSaving || !editForm.title.trim()}>
            {editSaving ? t('saving') : t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Delete */}
      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)}>
        <DialogTitle>{t('confirm_delete')}</DialogTitle>
        <DialogContent>
          <Typography>{t('jha_delete_confirm')}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>{t('cancel')}</Button>
          <Button variant="contained" color="error" onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}>
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
