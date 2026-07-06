import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import { WashTankReading } from '../models/owns/washTank';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface WashTankState {
  readings: WashTankReading[];
  weeklyReadings: WashTankReading[];
  loadingGet: boolean;
}

const initialState: WashTankState = {
  readings: [],
  weeklyReadings: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'washTank',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    setReadings(state, action: PayloadAction<{ readings: WashTankReading[] }>) {
      state.readings = action.payload.readings;
      state.loadingGet = false;
    },
    setWeeklyReadings(state, action: PayloadAction<{ readings: WashTankReading[] }>) {
      state.weeklyReadings = action.payload.readings;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    },
    addReading(state, action: PayloadAction<{ reading: WashTankReading }>) {
      state.readings.unshift(action.payload.reading);
    },
    editReading(state, action: PayloadAction<{ reading: WashTankReading }>) {
      const idx = state.readings.findIndex((r) => r.id === action.payload.reading.id);
      if (idx !== -1) state.readings[idx] = action.payload.reading;
    },
    removeReading(state, action: PayloadAction<{ id: number }>) {
      state.readings = state.readings.filter((r) => r.id !== action.payload.id);
    }
  }
});

export const { reducer } = slice;
export default reducer;

export const getReadings = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const readings = await api.get<WashTankReading[]>('wash-tank-readings');
  dispatch(slice.actions.setReadings({ readings }));
};

export const getWeeklyReadings =
  (from: string, to: string): AppThunk =>
  async (dispatch) => {
    const readings = await api.get<WashTankReading[]>(
      `wash-tank-readings/weekly?from=${from}&to=${to}`
    );
    dispatch(slice.actions.setWeeklyReadings({ readings }));
  };

export const createReading =
  (reading: Partial<WashTankReading>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<WashTankReading>('wash-tank-readings', reading);
    dispatch(slice.actions.addReading({ reading: result }));
  };

export const updateReading =
  (id: number, reading: Partial<WashTankReading>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<WashTankReading>(`wash-tank-readings/${id}`, reading);
    dispatch(slice.actions.editReading({ reading: result }));
  };

export const deleteReading =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`wash-tank-readings/${id}`);
    dispatch(slice.actions.removeReading({ id }));
  };
