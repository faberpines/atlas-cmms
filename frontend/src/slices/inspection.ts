import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import { Inspection, InspectionTemplate } from '../models/owns/inspection';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface InspectionState {
  templates: InspectionTemplate[];
  inspections: Inspection[];
  currentInspection: Inspection | null;
  loadingGet: boolean;
}

const initialState: InspectionState = {
  templates: [],
  inspections: [],
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
    addTemplate(state, action: PayloadAction<{ template: InspectionTemplate }>) {
      state.templates = [...state.templates, action.payload.template];
    },
    editTemplate(state, action: PayloadAction<{ template: InspectionTemplate }>) {
      state.templates = state.templates.map((t) =>
        t.id === action.payload.template.id ? action.payload.template : t
      );
    },
    deleteTemplate(state, action: PayloadAction<{ id: number }>) {
      state.templates = state.templates.filter((t) => t.id !== action.payload.id);
    },
    getInspections(state, action: PayloadAction<{ inspections: Inspection[] }>) {
      state.inspections = action.payload.inspections;
    },
    addInspection(state, action: PayloadAction<{ inspection: Inspection }>) {
      state.inspections = [...state.inspections, action.payload.inspection];
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

// ── Template thunks ──────────────────────────────────────────────────────────
export const getTemplates = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const templates = await api.get<InspectionTemplate[]>('inspection-templates');
    dispatch(slice.actions.getTemplates({ templates }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export const createTemplate =
  (data: any): AppThunk =>
  async (dispatch) => {
    const template = await api.post<InspectionTemplate>('inspection-templates', data);
    dispatch(slice.actions.addTemplate({ template }));
  };

export const editTemplate =
  (id: number, data: any): AppThunk =>
  async (dispatch) => {
    const template = await api.patch<InspectionTemplate>(`inspection-templates/${id}`, data);
    dispatch(slice.actions.editTemplate({ template }));
  };

export const deleteTemplate =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes<{ success: boolean }>(`inspection-templates/${id}`);
    dispatch(slice.actions.deleteTemplate({ id }));
  };

// ── Inspection thunks ────────────────────────────────────────────────────────
export const getInspections = (): AppThunk => async (dispatch) => {
  try {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    const inspections = await api.get<Inspection[]>('inspections');
    dispatch(slice.actions.getInspections({ inspections }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export const getInspectionsByWorkOrder =
  (workOrderId: number): AppThunk =>
  async (dispatch) => {
    const inspections = await api.get<Inspection[]>(`inspections/work-order/${workOrderId}`);
    dispatch(slice.actions.getInspections({ inspections }));
  };

export const getInspectionsByPM =
  (pmId: number): AppThunk =>
  async (dispatch) => {
    const inspections = await api.get<Inspection[]>(`inspections/pm/${pmId}`);
    dispatch(slice.actions.getInspections({ inspections }));
  };

export const getInspectionsByAsset =
  (assetId: number): AppThunk =>
  async (dispatch) => {
    dispatch(slice.actions.setLoadingGet({ loading: true }));
    try {
      const inspections = await api.get<Inspection[]>(`inspections/asset/${assetId}`);
      dispatch(slice.actions.getInspections({ inspections }));
    } finally {
      dispatch(slice.actions.setLoadingGet({ loading: false }));
    }
  };

export const createInspection =
  (data: any): AppThunk =>
  async (dispatch) => {
    const inspection = await api.post<Inspection>('inspections', data);
    dispatch(slice.actions.addInspection({ inspection }));
  };

export const editInspection =
  (id: number, data: any): AppThunk =>
  async (dispatch) => {
    const inspection = await api.patch<Inspection>(`inspections/${id}`, data);
    dispatch(slice.actions.editInspection({ inspection }));
  };

export const deleteInspection =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes<{ success: boolean }>(`inspections/${id}`);
    dispatch(slice.actions.deleteInspection({ id }));
  };

export default slice;
