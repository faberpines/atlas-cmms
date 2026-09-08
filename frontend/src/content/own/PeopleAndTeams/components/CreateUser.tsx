import { Button, CircularProgress, Grid, TextField, Typography } from '@mui/material';
import * as React from 'react';
import { useContext, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { createManagedUser } from '../../../../slices/user';
import { useDispatch } from '../../../../store';
import { CustomSnackBarContext } from '../../../../contexts/CustomSnackBarContext';

export default function CreateUser({
  roleId,
  onClose,
  onRefreshUsers
}: {
  roleId: number;
  onClose: () => void;
  onRefreshUsers: () => void;
}) {
  const dispatch = useDispatch();
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <Formik
      initialValues={{ displayName: '', username: '', password: '' }}
      validationSchema={Yup.object({
        username: Yup.string().matches(/^[a-zA-Z0-9._-]+$/, 'Use letters, numbers, dots, dashes, or underscores only').min(3).max(80).required('Username is required'),
        password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
        displayName: Yup.string().max(160)
      })}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await dispatch(createManagedUser({ ...values, roleId }));
          showSnackBar('User account created', 'success');
          onRefreshUsers();
          onClose();
        } catch (error: any) {
          let message = 'The user account could not be created';
          try { message = JSON.parse(error.message).message || message; } catch (_) {}
          showSnackBar(message, 'error');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) => (
        <Grid component="form" container spacing={2} onSubmit={handleSubmit} sx={{ pb: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h5">Create a username account</Typography>
            <Typography variant="body2" color="text.secondary">No email address is required. Select access above, then assign a username and temporary password.</Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="displayName" label="Display name (optional)" value={values.displayName} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.displayName && errors.displayName)} helperText={touched.displayName && errors.displayName} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="username" label="Username" autoComplete="off" value={values.username} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.username && errors.username)} helperText={touched.username && errors.username} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="password" label="Temporary password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={values.password} onChange={handleChange} onBlur={handleBlur} error={Boolean(touched.password && errors.password)} helperText={(touched.password && errors.password) || 'At least 8 characters'} />
            <Button size="small" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide password' : 'Show password'}</Button>
          </Grid>
          <Grid item xs={12}>
            <Button fullWidth type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size="1rem" /> : null}>Create account</Button>
          </Grid>
        </Grid>
      )}
    </Formik>
  );
}
