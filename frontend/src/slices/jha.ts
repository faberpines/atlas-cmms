import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import JhaDocument from '../models/owns/jha';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface JhaState {
  documents: JhaDocument[];
  loadingGet: boolean;
}

const initialState: JhaState = {
  documents: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'jha',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getDocuments(state, action: PayloadAction<{ documents: JhaDocument[] }>) {
      state.documents = action.payload.documents;
      state.loadingGet = false;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    },
    addDocument(state, action: PayloadAction<{ document: JhaDocument }>) {
      state.documents.unshift(action.payload.document);
    },
    editDocument(state, action: PayloadAction<{ document: JhaDocument }>) {
      const idx = state.documents.findIndex((d) => d.id === action.payload.document.id);
      if (idx !== -1) state.documents[idx] = action.payload.document;
    },
    deleteDocument(state, action: PayloadAction<{ id: number }>) {
      state.documents = state.documents.filter((d) => d.id !== action.payload.id);
    }
  }
});

export const { reducer } = slice;
export default reducer;

export const getJhaDocuments = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  const documents = await api.get<JhaDocument[]>('jha');
  dispatch(slice.actions.getDocuments({ documents }));
};

export const deleteJhaDocument =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`jha/${id}`);
    dispatch(slice.actions.deleteDocument({ id }));
  };

export const updateJhaDocument =
  (id: number, patch: Partial<JhaDocument>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<JhaDocument>(`jha/${id}`, patch);
    dispatch(slice.actions.editDocument({ document: result }));
  };
