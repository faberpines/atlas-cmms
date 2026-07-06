import { InputAdornment, TextField, Tooltip, IconButton, CircularProgress, Box, Typography } from '@mui/material';
import { IField } from '../../type';
import { useTranslation } from 'react-i18next';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import { useState } from 'react';
import api from '../../../../utils/api';

interface PropsType extends IField {
  onChange: (event: any) => void;
  onBlur?: (event: any) => any;
  value: any | '';
  placeholder?: string;
  error?: any;
  isDisabled?: boolean;
  //   fieldStyle?: any;
  errorMessage?: any;
  fullWidth?: boolean;
  //   helperText?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  required?: boolean;
}

export default (props: PropsType) => {
  const { t, i18n }: { t: any; i18n: any } = useTranslation();
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const canTranslate = props.type === 'text' && !props.isDisabled;
  const targetLang = i18n.language?.startsWith('es') ? 'es' : 'en';
  const targetLangLabel = targetLang === 'es' ? 'Español' : 'English';

  const handleTranslate = async () => {
    if (!props.value || translating) return;
    setTranslating(true);
    setTranslateError(null);
    try {
      const result = await api.post<{ translation: string }>('assistant/translate', {
        text: props.value,
        targetLanguage: targetLang
      });
      if (result?.translation) {
        props.onChange({ target: { value: result.translation } });
      }
    } catch (e: any) {
      setTranslateError(t('translation_failed') || 'Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const helperText = translating
    ? `⏳ ${t('translating') || 'Translating'} → ${targetLangLabel}… (${t('please_wait') || 'please wait ~20s'})`
    : translateError
    ? translateError
    : t(props.error ? props.errorMessage : props.helperText);

  return (
    <TextField
      error={props.error || !!translateError}
      fullWidth={props.fullWidth || true}
      helperText={helperText}
      label={t(`${props.label}`)}
      placeholder={props.placeholder ?? props.label}
      name={props.name}
      onBlur={props.onBlur}
      type={props.type}
      onChange={props.onChange}
      value={props.value ?? ''}
      variant={'outlined'}
      disabled={props.isDisabled || translating}
      required={props.required || false}
      multiline={props.multiple}
      rows={props.multiple && 4}
      InputProps={{
        startAdornment: props.icon ? (
          <InputAdornment position="start">{props.icon}</InputAdornment>
        ) : undefined,
        endAdornment: canTranslate && props.value ? (
          <InputAdornment position="end">
            <Tooltip title={translating ? `Translating to ${targetLangLabel}…` : `${t('translate_to')} ${targetLangLabel}`}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleTranslate}
                  disabled={translating}
                  tabIndex={-1}
                  color={translating ? 'primary' : 'default'}
                >
                  {translating
                    ? <CircularProgress size={18} color="primary" />
                    : <GTranslateIcon fontSize="small" sx={{ opacity: 0.6 }} />
                  }
                </IconButton>
              </span>
            </Tooltip>
          </InputAdornment>
        ) : undefined
      }}
      inputProps={{ min: '0' }}
    />
  );
};
