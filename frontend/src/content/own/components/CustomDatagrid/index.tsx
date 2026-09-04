import { DataGrid, DataGridProps, GridToolbarColumnsButton, GridToolbarContainer } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Stack, Typography, useTheme } from '@mui/material';
import gridLocaleText from './GridLocaleText';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { useEffect, useRef, useState } from 'react';
import { UiConfiguration } from '../../../../models/owns/uiConfiguration';
import type {
  GridColumns,
  GridEnrichedColDef
} from '@mui/x-data-grid/models/colDef/gridColDef';
import useAuth from '../../../../hooks/useAuth';

export type CustomDatagridColumn = GridEnrichedColDef & {
  uiConfigKey?: keyof Omit<UiConfiguration, 'id'>;
};
interface CustomDatagridProps extends DataGridProps {
  notClickable?: boolean;
  pro?: boolean;
  apiRef?: any;
  columns: CustomDatagridColumn[];
  /** When provided, a "Columns" button appears in the toolbar and visibility
   *  preferences are saved to localStorage under this key. */
  storageKey?: string;
}

function ColumnsToolbar() {
  return (
    <GridToolbarContainer sx={{ px: 1.5, py: 1 }}>
      <GridToolbarColumnsButton />
    </GridToolbarContainer>
  );
}

function CustomDataGrid(props: CustomDatagridProps) {
  const { t }: { t: any } = useTranslation();
  const theme = useTheme();
  const { height } = useWindowDimensions();
  const tableRef = useRef<HTMLDivElement>();
  const [tableHeight, setTableHeight] = useState<number>(500);
  const { user } = useAuth();

  // ── Persistent column visibility ──────────────────────────────────────────
  const { storageKey } = props;
  const lsKey = storageKey ? `col_vis_${storageKey}` : null;

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>(() => {
    if (!lsKey) return {};
    try {
      const saved = localStorage.getItem(lsKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleColumnVisibilityChange = (model: Record<string, boolean>) => {
    setColumnVisibilityModel(model);
    if (lsKey) {
      try { localStorage.setItem(lsKey, JSON.stringify(model)); } catch {}
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const getTableHeight = () => {
    if (tableRef.current) {
      const viewportOffset = tableRef.current.getBoundingClientRect();
      const top = viewportOffset.top;
      return height - top - 15;
    }
    return 500;
  };

  useEffect(() => {
    setTableHeight(getTableHeight());
  }, [tableRef.current]);

  const translatedGridLocaleText = Object.fromEntries(
    Object.entries(gridLocaleText).map(([key, value]) => {
      if (typeof value === 'function') {
        return [key, value];
      }
      return [key, t(value)];
    })
  );
  const { notClickable, pro, columns, apiRef: _apiRef, storageKey: _sk, ...rest } = props;

  // Build components object: allow caller to override toolbar, but if storageKey
  // is set and no toolbar override is provided, inject the columns toolbar.
  const callerComponents = (rest as any).components ?? {};
  const resolvedComponents = storageKey && !callerComponents.Toolbar
    ? { ...callerComponents, Toolbar: ColumnsToolbar }
    : callerComponents;

  return (
    <div
      ref={tableRef}
      style={{ height: tableHeight, minHeight: 360, width: '100%' }}
    >
      {/*@ts-ignore*/}
      <DataGrid
        sx={{
          border: 0,
          color: theme.palette.text.primary,
          '& .MuiDataGrid-columnHeaders': {
            borderBottom: `1px solid ${theme.palette.divider}`,
            backgroundColor: '#eef3eb',
            minHeight: '50px !important',
            maxHeight: '50px !important'
          },
          '& .MuiDataGrid-columnHeader': {
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.045em',
            fontSize: theme.typography.pxToRem(11),
            color: theme.palette.text.secondary
          },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-cell:focus': {
            outline: 'none'
          },
          '& .MuiDataGrid-columnHeader:focus-visible, & .MuiDataGrid-cell:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2
          },
          '& .MuiDataGrid-row': {
            cursor: notClickable ? 'auto' : 'pointer',
            transition: 'background-color 120ms cubic-bezier(0.16, 1, 0.3, 1)',
            '&:nth-of-type(even)': { backgroundColor: '#fbfcfa' },
            '&:hover': {
              backgroundColor: '#edf5e9',
              boxShadow: 'inset 4px 0 0 #4a7c2f'
            },
            '&:last-of-type .MuiDataGrid-cell': { borderBottom: 0 }
          },
          '& .MuiDataGrid-cell': {
            borderColor: theme.palette.divider,
            display: 'flex',
            alignItems: 'center',
            fontSize: theme.typography.pxToRem(13)
          },
          '& .MuiDataGrid-footerContainer': {
            minHeight: 52,
            borderTop: `1px solid ${theme.palette.divider}`
          },
          '& .MuiDataGrid-toolbarContainer': {
            borderBottom: `1px solid ${theme.palette.divider}`
          },
          '& .MuiDataGrid-overlay': {
            backgroundColor: theme.palette.background.paper
          }
        }}
        components={{
          NoRowsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              <Typography variant="h3">{t('no_content')}</Typography>
            </Stack>
          ),
          NoResultsOverlay: () => (
            <Stack height="100%" alignItems="center" justifyContent="center">
              <Typography variant="h3">{t('no_result_criteria')}</Typography>
            </Stack>
          ),
          ...resolvedComponents
        }}
        {...rest}
        columns={props.columns.filter((col) =>
          col.uiConfigKey ? user.uiConfiguration[col.uiConfigKey] : true
        )}
        {...(lsKey ? {
          columnVisibilityModel,
          onColumnVisibilityModelChange: handleColumnVisibilityChange
        } : {})}
        disableSelectionOnClick
        localeText={translatedGridLocaleText}
      />
    </div>
  );
}

export default CustomDataGrid;

