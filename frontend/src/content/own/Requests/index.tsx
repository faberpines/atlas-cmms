import { Helmet } from 'react-helmet-async';
import {
  Box,
  Button,
  Card,
  debounce,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  Grid,
  Stack,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useContext, useEffect, useMemo, useState } from 'react';
import { TitleContext } from '../../../contexts/TitleContext';
import {
  addRequest,
  clearSingleRequest,
  deleteRequest,
  editRequest,
  getRequests,
  getSingleRequest
} from '../../../slices/request';
import { useDispatch, useSelector } from '../../../store';
import ConfirmDialog from '../components/ConfirmDialog';
import { GridEnrichedColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import CustomDataGrid from '../components/CustomDatagrid';
import {
  GridRenderCellParams,
  GridToolbar,
  GridValueGetterParams
} from '@mui/x-data-grid';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import Request from '../../../models/owns/request';
import Form from '../components/form';
import * as Yup from 'yup';
import { IField } from '../type';
import RequestDetails from './RequestDetails';
import { useNavigate, useParams } from 'react-router-dom';
import { isNumeric } from '../../../utils/validators';
import { CustomSnackBarContext } from '../../../contexts/CustomSnackBarContext';
import PriorityWrapper from '../components/PriorityWrapper';
import { formatSelect, formatSelectMultiple } from '../../../utils/formatters';
import useAuth from '../../../hooks/useAuth';
import { CompanySettingsContext } from '../../../contexts/CompanySettingsContext';
import { getWOBaseFields, getWOBaseValues } from '../../../utils/woBase';
import { PermissionEntity } from '../../../models/owns/role';
import PermissionErrorMessage from '../components/PermissionErrorMessage';
import NoRowsMessageWrapper from '../components/NoRowsMessageWrapper';
import { getImageAndFiles, onSearchQueryChange } from '../../../utils/overall';
import {
  FilterField,
  SearchCriteria,
  SortDirection
} from '../../../models/owns/page';
import { useGridApiRef } from '@mui/x-data-grid';
import useGridStatePersist from '../../../hooks/useGridStatePersist';
import _ from 'lodash';
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone';
import EnumFilter from '../WorkOrders/Filters/EnumFilter';
import SignalCellularAltTwoToneIcon from '@mui/icons-material/SignalCellularAltTwoTone';
import CircleTwoToneIcon from '@mui/icons-material/CircleTwoTone';
import SearchInput from '../components/SearchInput';
import * as React from 'react';
import WorkOrder from '../../../models/owns/workOrder';

function Files() {
  const { t }: { t: any } = useTranslation();
  const { setTitle } = useContext(TitleContext);
  const [openAddModal, setOpenAddModal] = useState<boolean>(false);
  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const {
    companySettings,
    hasViewPermission,
    hasCreatePermission,
    getFilteredFields,
    user
  } = useAuth();
  const { workOrderRequestConfiguration } = companySettings;
  const [currentRequest, setCurrentRequest] = useState<Request>();
  const { uploadFiles, getFormattedDate } = useContext(CompanySettingsContext);
  const { requestId } = useParams();
  const dispatch = useDispatch();
  const [openDelete, setOpenDelete] = useState<boolean>(false);
  const { requests, loadingGet, singleRequest } = useSelector(
    (state) => state.requests
  );
  const [openDrawerFromUrl, setOpenDrawerFromUrl] = useState<boolean>(false);
  const defaultFilterFields: FilterField[] = [
    {
      field: 'priority',
      operation: 'in',
      values: [],
      value: '',
      enumName: 'PRIORITY'
    },
    {
      field: 'status',
      operation: 'in',
      values: ['APPROVED', 'CANCELLED', 'PENDING'],
      value: '',
      enumName: 'STATUS'
    }
  ];
  const [criteria, setCriteria] = useState<SearchCriteria>({
    filterFields: defaultFilterFields,
    pageSize: 10,
    pageNum: 0,
    direction: 'DESC'
  });
  const { showSnackBar } = useContext(CustomSnackBarContext);
  const navigate = useNavigate();
  const handleOpenDrawer = (request: Request) => {
    setCurrentRequest(request);
    window.history.replaceState(
      null,
      'Request details',
      `/app/requests/${request.id}`
    );
    setOpenDrawer(true);
  };
  useEffect(() => {
    setTitle(t('requests'));
  }, []);
  useEffect(() => {
    if (requestId && isNumeric(requestId)) {
      dispatch(getSingleRequest(Number(requestId)));
    }
  }, [requestId]);

  useEffect(() => {
    if (hasViewPermission(PermissionEntity.REQUESTS))
      dispatch(getRequests(criteria));
  }, [criteria]);

  //see changes in ui on edit
  useEffect(() => {
    if (singleRequest || requests.content.length) {
      const currentInContent = requests.content.find(
        (request) => request.id === currentRequest?.id
      );
      const updatedRequest = currentInContent ?? singleRequest;
      if (updatedRequest) {
        if (openDrawerFromUrl) {
          setCurrentRequest(updatedRequest);
        } else {
          handleOpenDrawer(updatedRequest);
          setOpenDrawerFromUrl(true);
        }
      }
    }
    return () => {
      dispatch(clearSingleRequest());
    };
  }, [singleRequest, requests]);

  const onPageSizeChange = (size: number) => {
    setCriteria({ ...criteria, pageSize: size });
  };
  const onPageChange = (number: number) => {
    setCriteria({ ...criteria, pageNum: number });
  };

  const handleDelete = (id: number) => {
    handleCloseDetails();
    dispatch(deleteRequest(id)).then(onDeleteSuccess).catch(onDeleteFailure);
    setOpenDelete(false);
  };
  const handleOpenUpdate = () => {
    setOpenUpdateModal(true);
  };
  const onCreationSuccess = () => {
    setOpenAddModal(false);
    showSnackBar(t('request_create_success'), 'success');
  };
  const onCreationFailure = (err) =>
    showSnackBar(t('request_create_failure'), 'error');
  const onEditSuccess = () => {
    setOpenUpdateModal(false);
    showSnackBar(t('changes_saved_success'), 'success');
  };
  const onEditFailure = (err) =>
    showSnackBar(t('request_edit_failure'), 'error');
  const onDeleteSuccess = () => {
    showSnackBar(t('request_delete_success'), 'success');
  };
  const onDeleteFailure = (err) =>
    showSnackBar(t('request_delete_failure'), 'error');

  const handleOpenDetails = (id: number) => {
    const foundRequest = requests.content.find((request) => request.id === id);
    if (foundRequest) {
      if (foundRequest.workOrder) {
        navigate(`/app/work-orders/${foundRequest.workOrder.id}`);
      } else {
        handleOpenDrawer(foundRequest);
      }
    }
  };
  const handleCloseDetails = () => {
    window.history.replaceState(null, 'Request', `/app/requests`);
    setOpenDrawer(false);
  };
  const formatValues = (values) => {
    const newValues = { ...values };
    newValues.primaryUser = formatSelect(newValues.primaryUser);
    newValues.location = formatSelect(newValues.location);
    newValues.team = formatSelect(newValues.team);
    newValues.asset = formatSelect(newValues.asset);
    newValues.assignedTo = formatSelectMultiple(newValues.assignedTo);
    newValues.priority = newValues.priority?.value;
    newValues.category = formatSelect(newValues.category);
    return newValues;
  };
  const columns: GridEnrichedColDef[] = [
    {
      field: 'customId',
      headerName: t('id'),
      description: t('id')
    },
    {
      field: 'title',
      headerName: t('title'),
      description: t('title'),
      width: 150,
      renderCell: (params: GridRenderCellParams<string>) => (
        <Box sx={{ fontWeight: 'bold' }}>{params.value}</Box>
      )
    },
    {
      field: 'description',
      headerName: t('description'),
      description: t('description'),
      width: 300
    },
    {
      field: 'priority',
      headerName: t('priority'),
      description: t('priority'),
      width: 150,
      renderCell: (params: GridRenderCellParams<string>) => (
        <PriorityWrapper priority={params.value} />
      )
    },
    {
      field: 'status',
      headerName: t('status'),
      description: t('status'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<null, Request>) =>
        params.row.cancelled
          ? t('rejected')
          : params.row.workOrder
          ? t('approved')
          : t('pending')
    },
    {
      field: 'dueDate',
      headerName: t('due_date'),
      description: t('due_date'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<null, Request>) =>
        getFormattedDate(params.value)
    },
    {
      field: 'createdAt',
      headerName: t('created_at'),
      description: t('created_at'),
      width: 150,
      valueGetter: (params: GridValueGetterParams<null, Request>) =>
        getFormattedDate(params.value)
    }
  ];
  const apiRef = useGridApiRef();
  useGridStatePersist(apiRef, columns, 'request');
  const defaultFields: Array<IField> = [...getWOBaseFields(t)];
  const defaultShape = {
    title: Yup.string().required(t('required_request_name'))
  };
  const getFieldsAndShapes = (): [Array<IField>, { [key: string]: any }] => {
    let fields = [...getFilteredFields(defaultFields)];
    if (user.role.code === 'REQUESTER') {
      fields = fields.map((field) =>
        field.name === 'asset'
          ? { ...field, allowedAssetTypes: ['WAREHOUSE_EQUIPMENT'] }
          : field
      );
    }
    let shape = { ...defaultShape };
    const fieldsToConfigure = [
      'asset',
      'location',
      'primaryUser',
      'category',
      'dueDate',
      'team'
    ];
    fieldsToConfigure.forEach((name) => {
      const fieldConfig =
        workOrderRequestConfiguration.fieldConfigurations.find(
          (fc) => fc.fieldName === name
        );
      const fieldIndexInFields = fields.findIndex(
        (field) => field.name === name
      );
      if (fieldConfig.fieldType === 'REQUIRED') {
        fields[fieldIndexInFields] = {
          ...fields[fieldIndexInFields],
          required: true
        };
        const requiredMessage = t('required_field');
        let yupSchema;
        switch (fields[fieldIndexInFields].type) {
          case 'text':
            yupSchema = Yup.string().required(requiredMessage);
            break;
          case 'date':
            yupSchema = Yup.string().required(requiredMessage);
            break;
          case 'number':
            yupSchema = Yup.number().required(requiredMessage);
            break;
          default:
            yupSchema = Yup.object().required(requiredMessage).nullable();
            break;
        }
        shape[name] = yupSchema;
      } else if (fieldConfig.fieldType === 'HIDDEN') {
        fields.splice(fieldIndexInFields, 1);
      }
    });

    return [fields, shape];
  };
  const onQueryChange = (event) => {
    onSearchQueryChange<WorkOrder>(event, criteria, setCriteria, [
      'title',
      'description'
    ]);
  };
  const debouncedQueryChange = useMemo(() => debounce(onQueryChange, 1300), []);

  const onFilterChange = (newFilters: FilterField[]) => {
    const newCriteria = { ...criteria };
    newCriteria.filterFields = newFilters;
    setCriteria(newCriteria);
  };
  const PUMPKIN_PALS = [
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/jack.png',
      name: 'Jack',
      top: -18,
      left: 0,
      size: 72
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/daisy.png',
      name: 'Daisy Kae',
      top: -22,
      left: 60,
      size: 68
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/chelsea.png',
      name: 'Chelsea',
      top: -14,
      left: 118,
      size: 64
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/yaya.png',
      name: 'Ya Ya',
      top: -20,
      left: 176,
      size: 70
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/gracie.png',
      name: 'Gracie',
      top: -16,
      left: 238,
      size: 66
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/vinny.png',
      name: 'Vinny',
      top: -22,
      left: 298,
      size: 72
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/joy.png',
      name: 'Joy',
      top: -14,
      left: 360,
      size: 64
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/spazal.png',
      name: 'Spazal',
      top: -20,
      left: 418,
      size: 70
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/devkin.png',
      name: 'Devkin',
      top: -18,
      left: 480,
      size: 66
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/nader.png',
      name: 'Nader D.',
      top: -22,
      left: 540,
      size: 68
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/beezie.png',
      name: 'Beezie',
      top: -16,
      left: 600,
      size: 64
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/bigmax.png',
      name: 'Big Max',
      top: -28,
      left: 658,
      size: 80
    },
    {
      url: 'https://cdn.shopify.com/s/files/1/0248/3817/6823/files/rerr.png',
      name: 'Rerr',
      top: -14,
      left: 732,
      size: 60
    }
  ];

  const renderAddModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openAddModal}
      onClose={() => setOpenAddModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3,
          pb: 1,
          overflow: 'visible',
          position: 'relative'
        }}
      >
        {/* Pumpkin Patch Pals — scattered across the top */}
        <Box
          sx={{
            position: 'relative',
            height: 72,
            mb: 1,
            overflow: 'visible'
          }}
        >
          {PUMPKIN_PALS.map((pal) => (
            <Box
              key={pal.name}
              component="img"
              src={pal.url}
              alt={pal.name}
              title={pal.name}
              sx={{
                position: 'absolute',
                top: pal.top,
                left: pal.left,
                width: pal.size,
                height: 'auto',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.18) rotate(-4deg)',
                  zIndex: 10
                },
                zIndex: 1,
                pointerEvents: 'auto'
              }}
            />
          ))}
        </Box>
        <Typography variant="h4" gutterBottom>
          {t('add_request')}
        </Typography>
        <Typography variant="subtitle2">
          {t('add_request_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={getFieldsAndShapes()[0]}
            validation={Yup.object().shape(getFieldsAndShapes()[1])}
            submitText={t('add')}
            values={{}}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatValues(values);
              return new Promise<void>((resolve, rej) => {
                uploadFiles(formattedValues.files, formattedValues.image)
                  .then((files) => {
                    const imageAndFiles = getImageAndFiles(files);
                    formattedValues = {
                      ...formattedValues,
                      image: imageAndFiles.image,
                      files: imageAndFiles.files
                    };
                    dispatch(addRequest(formattedValues))
                      .then(onCreationSuccess)
                      .catch(onCreationFailure)
                      .finally(resolve);
                  })
                  .catch((err) => {
                    onCreationFailure(err);
                    rej(err);
                  });
              });
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  const renderUpdateModal = () => (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openUpdateModal}
      onClose={() => setOpenUpdateModal(false)}
    >
      <DialogTitle
        sx={{
          p: 3
        }}
      >
        <Typography variant="h4" gutterBottom>
          {t('edit_request')}
        </Typography>
        <Typography variant="subtitle2">
          {t('edit_request_description')}
        </Typography>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          p: 3
        }}
      >
        <Box>
          <Form
            fields={getFieldsAndShapes()[0]}
            validation={Yup.object().shape(getFieldsAndShapes()[1])}
            submitText={t('save')}
            values={{
              ...currentRequest,
              ...getWOBaseValues(t, currentRequest)
            }}
            onChange={({ field, e }) => {}}
            onSubmit={async (values) => {
              let formattedValues = formatValues(values);
              return new Promise<void>((resolve, rej) => {
                const files = formattedValues.files.find((file) => file.id)
                  ? []
                  : formattedValues.files;
                uploadFiles(files, formattedValues.image)
                  .then((files) => {
                    const imageAndFiles = getImageAndFiles(
                      files,
                      currentRequest.image
                    );
                    formattedValues = {
                      ...formattedValues,
                      image: imageAndFiles.image,
                      files: [...currentRequest.files, ...imageAndFiles.files]
                    };
                    dispatch(editRequest(currentRequest?.id, formattedValues))
                      .then(onEditSuccess)
                      .catch(onEditFailure)
                      .finally(resolve);
                  })
                  .catch((err) => {
                    onEditFailure(err);
                    rej(err);
                  });
              });
            }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
  if (hasViewPermission(PermissionEntity.REQUESTS))
    return (
      <>
        <Helmet>
          <title>{t('requests')}</title>
        </Helmet>
        {renderAddModal()}
        {renderUpdateModal()}
        <Box justifyContent="center" alignItems="stretch" paddingX={4}>
          {hasCreatePermission(PermissionEntity.REQUESTS) && (
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="right"
              alignItems="center"
            >
              <Button
                startIcon={<AddTwoToneIcon />}
                sx={{ my: 1 }}
                variant="contained"
                onClick={() => setOpenAddModal(true)}
              >
                {t('request')}
              </Button>
            </Box>
          )}
          <Card
            sx={{
              py: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Stack
              sx={{ ml: 1 }}
              direction="row"
              spacing={1}
              justifyContent={'flex-start'}
              width={'95%'}
            >
              <EnumFilter
                filterFields={criteria.filterFields}
                onChange={onFilterChange}
                completeOptions={['NONE', 'LOW', 'MEDIUM', 'HIGH']}
                fieldName="priority"
                icon={<SignalCellularAltTwoToneIcon />}
              />
              <EnumFilter
                filterFields={criteria.filterFields}
                onChange={onFilterChange}
                completeOptions={['APPROVED', 'CANCELLED', 'PENDING']}
                fieldName="status"
                icon={<CircleTwoToneIcon />}
              />
              <SearchInput onChange={debouncedQueryChange} />
            </Stack>
            <Divider sx={{ mt: 1 }} />
            <Box sx={{ width: '95%' }}>
              <CustomDataGrid
                apiRef={apiRef}
                storageKey="requests"
                columns={columns}
                pageSize={criteria.pageSize}
                page={criteria.pageNum}
                rows={requests.content}
                rowCount={requests.totalElements}
                loading={loadingGet}
                pagination
                paginationMode="server"
                onPageSizeChange={onPageSizeChange}
                onPageChange={onPageChange}
                rowsPerPageOptions={[10, 20, 50]}
                onRowClick={({ id }) => handleOpenDetails(Number(id))}
                components={{
                  NoRowsOverlay: () => (
                    <NoRowsMessageWrapper
                      message={t('noRows.request.message')}
                      action={t('noRows.request.action')}
                    />
                  )
                }}
                onSortModelChange={(model) => {
                  if (model.length === 0) {
                    setCriteria({
                      ...criteria,
                      sortField: undefined,
                      direction: undefined
                    });
                    return;
                  }

                  const fieldMapping = {
                    customId: 'customId',
                    title: 'title',
                    description: 'description',
                    priority: 'priority',
                    // status: 'status',
                    createdAt: 'createdAt',
                    dueDate: 'dueDate'
                  };

                  const field = model[0].field;
                  const mappedField = fieldMapping[field];

                  if (!mappedField) return;

                  setCriteria({
                    ...criteria,
                    sortField: mappedField,
                    direction: (model[0].sort?.toUpperCase() ||
                      'ASC') as SortDirection
                  });
                }}
                sortingMode={'server'}
                initialState={{
                  columns: {
                    columnVisibilityModel: {}
                  }
                }}
              />
            </Box>
          </Card>
        </Box>
        <Drawer
          anchor="right"
          open={openDrawer}
          onClose={handleCloseDetails}
          PaperProps={{
            sx: { width: '50%' }
          }}
        >
          <RequestDetails
            onClose={handleCloseDetails}
            request={currentRequest}
            handleOpenUpdate={handleOpenUpdate}
            handleOpenDelete={() => setOpenDelete(true)}
          />
        </Drawer>
        <ConfirmDialog
          open={openDelete}
          onCancel={() => {
            setOpenDelete(false);
            setOpenDrawer(true);
          }}
          onConfirm={() => handleDelete(currentRequest?.id)}
          confirmText={t('to_delete')}
          question={t('confirm_delete_request')}
        />
      </>
    );
  else return <PermissionErrorMessage message={'no_access_requests'} />;
}

export default Files;
