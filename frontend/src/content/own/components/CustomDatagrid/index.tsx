import { DataGrid, DataGridProps, GridToolbarColumnsButton, GridToolbarContainer } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import gridLocaleText from './GridLocaleText';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  /** Optional stable name for the saved layout. When omitted, one is generated
   *  from the current page and the grid's column fields. */
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

  // Keep every grid's visible columns and resized widths on this browser.
  const generatedStorageKey = useMemo(() => {
    const route = window.location.pathname.replace(/[^a-z0-9]+/gi, '_');
    const fields = props.columns.map(({ field }) => field).join('_');
    return `auto${route}_${fields}`;
  }, [props.columns]);
  const storageKey = props.storageKey || generatedStorageKey;
  const visibilityStorageKey = `col_vis_${storageKey}`;
  const widthStorageKey = `col_width_${storageKey}`;

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(visibilityStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleColumnVisibilityChange = (model: Record<string, boolean>) => {
    setColumnVisibilityModel(model);
    try { localStorage.setItem(visibilityStorageKey, JSON.stringify(model)); } catch {}
  };

  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(widthStorageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const savedWidthsRef = useRef(JSON.stringify(columnWidths));

  const beginColumnResize = (
    event: React.MouseEvent,
    column: CustomDatagridColumn,
    currentWidth: number
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = columnWidths[column.field] || currentWidth || column.width || 100;
    const minWidth = column.minWidth || 50;
    const maxWidth = column.maxWidth || 1200;
    let finalWidth = startWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      finalWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + moveEvent.clientX - startX));
      setColumnWidths((current) => ({ ...current, [column.field]: finalWidth }));
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      const nextWidths = { ...columnWidths, [column.field]: Math.round(finalWidth) };
      savedWidthsRef.current = JSON.stringify(nextWidths);
      try { localStorage.setItem(widthStorageKey, savedWidthsRef.current); } catch {}
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleGridStateChange = (state: any, event: any, details: any) => {
    const nextWidths = Object.fromEntries(
      Object.entries(state?.columns?.lookup || {}).map(([field, column]: [string, any]) =>
        [field, Math.round(column.computedWidth || column.width)]
      )
    );
    const serialized = JSON.stringify(nextWidths);
    if (serialized !== savedWidthsRef.current) {
      savedWidthsRef.current = serialized;
      try { localStorage.setItem(widthStorageKey, serialized); } catch {}
    }
    props.onStateChange?.(state, event, details);
  };

  const persistedColumns = useMemo(() => props.columns
    .filter((col) => col.uiConfigKey ? user.uiConfiguration[col.uiConfigKey] : true)
    .map((col) => {
      const savedWidth = columnWidths[col.field];
      const originalRenderHeader = col.renderHeader;
      return {
        ...col,
        ...(savedWidth ? { flex: undefined, width: savedWidth } : {}),
        renderHeader: (params) => (
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              height: '100%',
              minWidth: 0,
              position: 'relative',
              width: '100%'
            }}
          >
            <Box sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {originalRenderHeader ? originalRenderHeader(params) : col.headerName}
            </Box>
            {col.resizable !== false && (
              <Box
                aria-label={`Resize ${col.headerName || col.field} column`}
                onMouseDown={(event) => beginColumnResize(
                  event,
                  col,
                  params.colDef.computedWidth
                )}
                role="separator"
                sx={{
                  bottom: 0,
                  cursor: 'col-resize',
                  position: 'absolute',
                  right: -10,
                  top: 0,
                  width: 18,
                  zIndex: 3,
                  '&::after': {
                    bgcolor: 'divider',
                    bottom: 9,
                    content: '""',
                    position: 'absolute',
                    right: 8,
                    top: 9,
                    width: 1
                  },
                  '&:hover::after': {
                    bgcolor: 'primary.main',
                    width: 2
                  }
                }}
              />
            )}
          </Box>
        )
      };
    }), [props.columns, columnWidths, user.uiConfiguration]);

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

  // Allow a caller toolbar override; otherwise every grid gets a Columns chooser.
  const callerComponents = (rest as any).components ?? {};
  const resolvedComponents = !callerComponents.Toolbar
    ? { ...callerComponents, Toolbar: ColumnsToolbar }
    : callerComponents;

  return (
    <div
      ref={tableRef}
      style={props.autoHeight
        ? { width: '100%' }
        : { height: tableHeight, minHeight: 360, width: '100%' }}
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
        columns={persistedColumns}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
        onStateChange={handleGridStateChange}
        disableSelectionOnClick
        localeText={translatedGridLocaleText}
      />
    </div>
  );
}

export default CustomDataGrid;

