import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import { BreakerPanel, Breaker } from '../models/owns/breakerPanel';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface BreakerPanelState {
  panels: BreakerPanel[];
  breakers: Breaker[];
  loadingGet: boolean;
}

const initialState: BreakerPanelState = {
  panels: [],
  breakers: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'breakerPanel',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    setPanels(state, action: PayloadAction<{ panels: BreakerPanel[] }>) {
      state.panels = action.payload.panels;
      state.loadingGet = false;
    },
    setBreakers(state, action: PayloadAction<{ breakers: Breaker[] }>) {
      state.breakers = action.payload.breakers;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    },
    addPanel(state, action: PayloadAction<{ panel: BreakerPanel }>) {
      state.panels.push(action.payload.panel);
    },
    editPanel(state, action: PayloadAction<{ panel: BreakerPanel }>) {
      const idx = state.panels.findIndex((p) => p.id === action.payload.panel.id);
      if (idx !== -1) state.panels[idx] = action.payload.panel;
    },
    removePanel(state, action: PayloadAction<{ id: number }>) {
      state.panels = state.panels.filter((p) => p.id !== action.payload.id);
      state.breakers = state.breakers.filter((b) => b.panel.id !== action.payload.id);
    },
    addBreaker(state, action: PayloadAction<{ breaker: Breaker }>) {
      state.breakers.push(action.payload.breaker);
    },
    editBreaker(state, action: PayloadAction<{ breaker: Breaker }>) {
      const idx = state.breakers.findIndex((b) => b.id === action.payload.breaker.id);
      if (idx !== -1) state.breakers[idx] = action.payload.breaker;
    },
    removeBreaker(state, action: PayloadAction<{ id: number }>) {
      state.breakers = state.breakers.filter((b) => b.id !== action.payload.id);
    }
  }
});

export const { reducer } = slice;
export default reducer;

export const getPanels = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const panels = await api.get<BreakerPanel[]>('breaker-panels');
  dispatch(slice.actions.setPanels({ panels }));
};

export const getAllBreakers = (): AppThunk => async (dispatch) => {
  const breakers = await api.get<Breaker[]>('breaker-panels/breakers');
  dispatch(slice.actions.setBreakers({ breakers }));
};

export const createPanel =
  (panel: Partial<BreakerPanel>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<BreakerPanel>('breaker-panels', panel);
    dispatch(slice.actions.addPanel({ panel: result }));
  };

export const updatePanel =
  (id: number, panel: Partial<BreakerPanel>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<BreakerPanel>(`breaker-panels/${id}`, panel);
    dispatch(slice.actions.editPanel({ panel: result }));
  };

export const deletePanel =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`breaker-panels/${id}`);
    dispatch(slice.actions.removePanel({ id }));
  };

export const createBreaker =
  (panelId: number, breaker: Partial<Breaker>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<Breaker>(`breaker-panels/${panelId}/breakers`, breaker);
    dispatch(slice.actions.addBreaker({ breaker: result }));
  };

export const updateBreaker =
  (id: number, breaker: Partial<Breaker>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<Breaker>(`breaker-panels/breakers/${id}`, breaker);
    dispatch(slice.actions.editBreaker({ breaker: result }));
  };

export const deleteBreaker =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`breaker-panels/breakers/${id}`);
    dispatch(slice.actions.removeBreaker({ id }));
  };
