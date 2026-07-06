import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import { Inspection, InspectionTemplate } from '../models/inspection';
import api from '../utils/api';
import { revertAll } from '../utils/redux';

const basePath = 'inspections';

interface InspectionState {
  templates: InspectionTemplate[];
  inspections: Inspection[];
  inspectionsByAsset: { [key: number]: Inspection[] };
  currentInspection: Inspection | null;
  loadingGet: boolean;
}

const initialState: InspectionState = {
  templates: [],
  inspections: [],
  inspectionsByAsset: {},
  currentInspection: null,
  loadingGet: false
};

const slice = createSlice({
  name: 'inspections',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getTemplates(state, action: PayloadAction<{ templates: InspectionTemplate[] }>) {
      state.templates = action.payload.templates;
    },
    getInspections(state, action: PayloadAction<{ inspections: Inspection[] }>) {
      state.inspections = action.payload.inspections;
    },
    getInspectionsByAsset(state, action: PayloadAction<{ assetId: number; inspections: Inspection[] }>) {
      state.inspectionsByAsset[action.payload.assetId] = action.payload.inspections;
    },
    addInspection(state, action: PayloadAction<{ inspection: Inspection }>) {
      state.inspections = [action.payload.inspection, ...state.inspections];
    },
    editInspection(state, action: PayloadAction<{ inspection: Inspection }>) {
      state.inspections = state.inspections.map((i) =>
        i.id === action.payload.inspection.id ? action.payload.inspection : i
      );
      if (state.currentInspection?.id === action.payload.inspection.id) {
        state.currentInspection = action.payload.inspection;
      }
    },
    deleteInspection(state, action: PayloadAction<{ id: number }>) {
      state.inspections = state.inspections.filter((i) => i.id !== action.payload.id);
    },
    setCurrentInspection(state, action: PayloadAction<{ inspection: Inspection }>) {
      state.currentInspection = action.payload.inspection;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    }
  }
});

export const reducer = slice.reducer;

export const getTemplates = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  try {
    const templates = await api.get<InspectionTemplate[]>('inspection-templates');
    dispatch(slice.actions.getTemplates({ templates }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export const getInspections = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  try {
    const inspections = await api.get<Inspection[]>(`${basePath}`);
    dispatch(slice.actions.getInspections({ inspections }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export const getInspectionsByAsset = (assetId: number): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  try {
    const inspections = await api.get<Inspection[]>(`${basePath}/asset/${assetId}`);
    dispatch(slice.actions.getInspectionsByAsset({ assetId, inspections }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export const createInspection = (body: Partial<Inspection>): AppThunk => async (dispatch) => {
  const inspection = await api.post<Inspection>(`${basePath}`, body);
  dispatch(slice.actions.addInspection({ inspection }));
  return inspection;
};

export const updateInspection = (id: number, body: Partial<Inspection>): AppThunk => async (dispatch) => {
  const inspection = await api.patch<Inspection>(`${basePath}/${id}`, body);
  dispatch(slice.actions.editInspection({ inspection }));
  return inspection;
};

export const deleteInspectionById = (id: number): AppThunk => async (dispatch) => {
  await api.deletes<{ id: number }>(`${basePath}/${id}`);
  dispatch(slice.actions.deleteInspection({ id }));
};

export default slice;
