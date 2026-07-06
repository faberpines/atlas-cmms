import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import HearingConservationRecord from '../models/owns/hearingConservation';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface HearingConservationState {
  records: HearingConservationRecord[];
  loadingGet: boolean;
}

const initialState: HearingConservationState = {
  records: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'hearingConservation',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getRecords(state, action: PayloadAction<{ records: HearingConservationRecord[] }>) {
      state.records = action.payload.records;
      state.loadingGet = false;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    },
    addRecord(state, action: PayloadAction<{ record: HearingConservationRecord }>) {
      state.records.push(action.payload.record);
    },
    editRecord(state, action: PayloadAction<{ record: HearingConservationRecord }>) {
      const idx = state.records.findIndex((r) => r.id === action.payload.record.id);
      if (idx !== -1) state.records[idx] = action.payload.record;
    },
    deleteRecord(state, action: PayloadAction<{ id: number }>) {
      state.records = state.records.filter((r) => r.id !== action.payload.id);
    }
  }
});

export const { reducer } = slice;
export default reducer;

export const getHearingConservationRecords = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const records = await api.get<HearingConservationRecord[]>('hearing-conservation');
  dispatch(slice.actions.getRecords({ records }));
};

export const createHearingConservationRecord =
  (record: Partial<HearingConservationRecord>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<HearingConservationRecord>('hearing-conservation', record);
    dispatch(slice.actions.addRecord({ record: result }));
  };

export const updateHearingConservationRecord =
  (id: number, record: Partial<HearingConservationRecord>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<HearingConservationRecord>(`hearing-conservation/${id}`, record);
    dispatch(slice.actions.editRecord({ record: result }));
  };

export const deleteHearingConservationRecord =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`hearing-conservation/${id}`);
    dispatch(slice.actions.deleteRecord({ id }));
  };
