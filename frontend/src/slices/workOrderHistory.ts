import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import WorkOrderHistory from '../models/owns/workOrderHistories';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

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
      action: PayloadAction<{ id: number; history: WorkOrderHistory }>
    ) {
      const { id, history } = action.payload;
      state.workOrderHistories[id] = [
        ...(state.workOrderHistories[id] ?? []),
        history
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
    const history = await api.post<WorkOrderHistory>(
      `${basePath}/work-order/${id}`,
      { name }
    );
    dispatch(slice.actions.addWorkOrderHistory({ id, history }));
  };

export default slice;
