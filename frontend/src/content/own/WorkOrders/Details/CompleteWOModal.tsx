import {
  Alert,
  Box,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import Form from '../../components/form';
import * as Yup from 'yup';
import { IField } from '../../type';
import { useContext, useState } from 'react';
import { CompanySettingsContext } from '../../../../contexts/CompanySettingsContext';
import { StoreReturnType } from '../../../../store';
import { getErrorMessage } from '../../../../utils/api';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';
import VerifiedTwoToneIcon from '@mui/icons-material/VerifiedTwoTone';

interface SignatureProps {
  open: boolean;
  onClose: () => void;
  fieldsConfig: { feedback: boolean; signature: boolean };
  onComplete: (
    signature: string | undefined,
    feedback: string
  ) => Promise<StoreReturnType>;
}

interface FoodSafetyCheck {
  key: string;
  labelKey: string;
}

const FOOD_SAFETY_CHECKS: FoodSafetyCheck[] = [
  { key: 'fs_tools',     labelKey: 'fs_tools_label'     },
  { key: 'fs_chemicals', labelKey: 'fs_chemicals_label' },
  { key: 'fs_equipment', labelKey: 'fs_equipment_label' },
  { key: 'fs_area',      labelKey: 'fs_area_label'      }
];

export default function CompleteWOModal({
  open,
  onClose,
  onComplete,
  fieldsConfig
}: SignatureProps) {
  const { t }: { t: any } = useTranslation();
  const { uploadFiles } = useContext(CompanySettingsContext);
  const { showSnackBar } = useContext(CustomSnackBarContext);

  const initialChecked = FOOD_SAFETY_CHECKS.reduce((acc, c) => {
    acc[c.key] = false;
    return acc;
  }, {} as Record<string, boolean>);

  const [fsChecked, setFsChecked] = useState<Record<string, boolean>>(initialChecked);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const allFsSatisfied = FOOD_SAFETY_CHECKS.every((c) => fsChecked[c.key]);

  const handleFsChange = (key: string, checked: boolean) => {
    setFsChecked((prev) => ({ ...prev, [key]: checked }));
  };

  // Reset state when dialog is closed/reopened
  const handleClose = () => {
    setFsChecked(initialChecked);
    setSubmitAttempted(false);
    onClose();
  };

  const getFieldsAndShape = (): [Array<IField>, { [key: string]: any }] => {
    let fields: IField[] = [];
    let shape: { [key: string]: any } = {};
    if (fieldsConfig.feedback) {
      fields.push({
        name: 'feedback',
        type: 'text',
        label: t('feedback'),
        placeholder: t('feedback_description'),
        multiple: true
      });
      shape.feedback = Yup.string().required(t('required_feedback'));
    }
    if (fieldsConfig.signature) {
      fields.push({
        name: 'signature',
        type: 'signature',
        label: t('signature')
      });
      shape.signature = Yup.string().required(t('required_signature'));
    }
    return [fields, shape];
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
      <DialogTitle sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('close_wo')}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3 }}>
        <Alert
          icon={<VerifiedTwoToneIcon fontSize="inherit" />}
          severity="warning"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2" fontWeight="bold">
            {t('fs_checklist_title')}
          </Typography>
          <Typography variant="caption">
            {t('fs_checklist_subtitle')}
          </Typography>
        </Alert>

        <Box sx={{ mb: 2 }}>
          {FOOD_SAFETY_CHECKS.map((check) => {
            const hasError = submitAttempted && !fsChecked[check.key];
            return (
              <Box key={check.key} sx={{ mb: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={fsChecked[check.key]}
                      onChange={(e) => handleFsChange(check.key, e.target.checked)}
                      color={hasError ? 'error' : 'primary'}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      color={hasError ? 'error' : 'textPrimary'}
                    >
                      {t(check.labelKey)}
                    </Typography>
                  }
                />
              </Box>
            );
          })}
          {submitAttempted && !allFsSatisfied && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {t('fs_required')}
            </Typography>
          )}
        </Box>

        <Form
          fields={getFieldsAndShape()[0]}
          validation={Yup.object().shape(getFieldsAndShape()[1])}
          submitText={t('close')}
          values={{}}
          onChange={({ field, e }) => {}}
          onSubmit={async (values) => {
            setSubmitAttempted(true);
            if (!allFsSatisfied) {
              return Promise.reject(new Error(t('fs_required')));
            }
            return onComplete(values.signature, values.feedback)
              .then(handleClose)
              .catch((err) => showSnackBar(getErrorMessage(err), 'error'));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
