import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import LotoRecord from '../models/owns/loto';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface LotoState {
  lotoRecords: LotoRecord[];
  loadingGet: boolean;
}

const initialState: LotoState = {
  lotoRecords: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'loto',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getLotoRecords(state, action: PayloadAction<{ records: LotoRecord[] }>) {
      state.lotoRecords = action.payload.records;
      state.loadingGet = false;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    },
    addLotoRecord(state, action: PayloadAction<{ record: LotoRecord }>) {
      state.lotoRecords.push(action.payload.record);
    },
    editLotoRecord(state, action: PayloadAction<{ record: LotoRecord }>) {
      const idx = state.lotoRecords.findIndex((r) => r.id === action.payload.record.id);
      if (idx !== -1) state.lotoRecords[idx] = action.payload.record;
    },
    deleteLotoRecord(state, action: PayloadAction<{ id: number }>) {
      state.lotoRecords = state.lotoRecords.filter((r) => r.id !== action.payload.id);
    }
  }
});

export const { reducer } = slice;
export default reducer;

export const getLotoRecords = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const records = await api.get<LotoRecord[]>('loto');
  dispatch(slice.actions.getLotoRecords({ records }));
};

export const createLotoRecord =
  (record: Partial<LotoRecord>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<LotoRecord>('loto', record);
    dispatch(slice.actions.addLotoRecord({ record: result }));
  };

export const updateLotoRecord =
  (id: number, record: Partial<LotoRecord>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<LotoRecord>(`loto/${id}`, record);
    dispatch(slice.actions.editLotoRecord({ record: result }));
  };

export const releaseLotoRecord =
  (id: number): AppThunk =>
  async (dispatch) => {
    const result = await api.post<LotoRecord>(`loto/${id}/release`, {});
    dispatch(slice.actions.editLotoRecord({ record: result }));
  };

export const deleteLotoRecord =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`loto/${id}`);
    dispatch(slice.actions.deleteLotoRecord({ id }));
  };
