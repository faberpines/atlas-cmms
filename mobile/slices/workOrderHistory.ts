import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from '../store';
import WorkOrderHistory from '../models/workOrderHistories';
import api from '../utils/api';
import { revertAll } from '../utils/redux';

const basePath = 'work-order-histories';
interface WorkOrderHistoriestate {
  workOrderHistories: { [id: number]: WorkOrderHistory[] };
}

const initialState: WorkOrderHistoriestate = {
  workOrderHistories: {}
};

const slice = createSlice({
  name: 'workOrderHistories',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getWorkOrderHistories(
      state: WorkOrderHistoriestate,
      action: PayloadAction<{
        id: number;
        workOrderHistories: WorkOrderHistory[];
      }>
    ) {
      const { workOrderHistories, id } = action.payload;
      state.workOrderHistories[id] = workOrderHistories;
    },
    addWorkOrderHistory(
      state: WorkOrderHistoriestate,
      action: PayloadAction<{ id: number; workOrderHistory: WorkOrderHistory }>
    ) {
      const { id, workOrderHistory } = action.payload;
      state.workOrderHistories[id] = [
        ...(state.workOrderHistories[id] ?? []),
        workOrderHistory
      ];
    }
  }
});

export const reducer = slice.reducer;

export const getWorkOrderHistories =
  (id: number): AppThunk =>
  async (dispatch) => {
    const workOrderHistories = await api.get<WorkOrderHistory[]>(
      `${basePath}/work-order/${id}`
    );
    dispatch(slice.actions.getWorkOrderHistories({ id, workOrderHistories }));
  };

export const addWorkOrderHistory =
  (id: number, name: string): AppThunk =>
  async (dispatch) => {
    const workOrderHistory = await api.post<WorkOrderHistory>(
      `${basePath}/work-order/${id}`,
      { name }
    );
    dispatch(slice.actions.addWorkOrderHistory({ id, workOrderHistory }));
  };

export default slice;
