import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography
} from '@mui/material';
import AndroidTwoToneIcon from '@mui/icons-material/AndroidTwoTone';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import EmailTwoToneIcon from '@mui/icons-material/EmailTwoTone';
import SendToMobileTwoToneIcon from '@mui/icons-material/SendToMobileTwoTone';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';

type AndroidUpdate = {
  version: string;
  apkUrl: string;
};

const fallbackApkPath = '/downloads/Bay-Baby-Maintenance-1.2.0.apk';

function AppDownloadInvite() {
  const { t }: { t: any } = useTranslation();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [version, setVersion] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(
    `${window.location.origin}${fallbackApkPath}`
  );

  useEffect(() => {
    fetch('/downloads/android-update.json', { cache: 'no-store' })
      .then((response) => {
        if (!response.ok) throw new Error('Update information unavailable');
        return response.json();
      })
      .then((update: AndroidUpdate) => {
        setVersion(update.version);
        setDownloadUrl(update.apkUrl || downloadUrl);
      })
      .catch(() => undefined);
  }, []);

  const message = useMemo(
    () =>
      t('app_download_invite_message', {
        link: downloadUrl,
        defaultValue:
          'Download the Bay Baby Maintenance app for Android here: {{link}}. If Android asks, allow installation from this source.'
      }),
    [downloadUrl, t]
  );

  const copyLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(downloadUrl);
    } else {
      const temporaryInput = document.createElement('textarea');
      temporaryInput.value = downloadUrl;
      temporaryInput.style.position = 'fixed';
      temporaryInput.style.opacity = '0';
      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      document.execCommand('copy');
      temporaryInput.remove();
    }
    showSnackBar(t('app_download_link_copied'), 'success');
  };

  const sendEmail = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      showSnackBar(t('invalid_email'), 'error');
      return;
    }
    window.location.href = `mailto:${encodeURIComponent(
      email.trim()
    )}?subject=${encodeURIComponent(
      t('app_download_email_subject')
    )}&body=${encodeURIComponent(message)}`;
  };

  const sendText = () => {
    if (!phone.trim()) {
      showSnackBar(t('app_download_phone_required'), 'error');
      return;
    }
    window.location.href = `sms:${phone.replace(
      /[^+\d]/g,
      ''
    )}?body=${encodeURIComponent(message)}`;
  };

  return (
    <Card sx={{ overflow: 'hidden' }}>
      <Box
        p={3}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          background:
            'linear-gradient(120deg, rgba(55, 112, 38, 0.14), rgba(234, 117, 38, 0.08))'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <AndroidTwoToneIcon fontSize="large" />
          </Box>
          <Box>
            <Typography variant="h4" gutterBottom>
              {t('app_download_title')}
            </Typography>
            <Typography variant="subtitle2">
              {t('app_download_description')}
            </Typography>
          </Box>
        </Box>
        {version && <Chip color="primary" label={`v${version}`} />}
      </Box>
      <Divider />
      <CardContent sx={{ p: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('app_download_admin_only_note')}
        </Alert>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {t('app_download_send_email')}
            </Typography>
            <Box display="flex" gap={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                size="small"
                type="email"
                label={t('new_user_email')}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailTwoToneIcon />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={sendEmail}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {t('send')}
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {t('app_download_send_text')}
            </Typography>
            <Box display="flex" gap={1.5} alignItems="flex-start">
              <TextField
                fullWidth
                size="small"
                type="tel"
                label={t('new_user_phone')}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SendToMobileTwoToneIcon />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="contained"
                onClick={sendText}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {t('send')}
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {t('app_download_link')}
            </Typography>
            <Box display="flex" gap={1.5} alignItems="center">
              <TextField
                fullWidth
                size="small"
                value={downloadUrl}
                inputProps={{ readOnly: true }}
              />
              <Button
                variant="outlined"
                startIcon={<ContentCopyTwoToneIcon />}
                onClick={copyLink}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {t('copy_link')}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

export default AppDownloadInvite;
