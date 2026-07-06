import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { AppThunk } from 'src/store';
import Vehicle, { LoraDevice, VehicleLocation } from '../models/owns/vehicle';
import api from '../utils/api';
import { revertAll } from 'src/utils/redux';

interface VehicleState {
  vehicles: Vehicle[];
  loraDevices: LoraDevice[];
  latestLocations: { vehicle: Vehicle; location: VehicleLocation }[];
  loadingGet: boolean;
}

const initialState: VehicleState = {
  vehicles: [],
  loraDevices: [],
  latestLocations: [],
  loadingGet: false
};

const slice = createSlice({
  name: 'vehicles',
  initialState,
  extraReducers: (builder) => builder.addCase(revertAll, () => initialState),
  reducers: {
    getVehicles(state, action: PayloadAction<{ vehicles: Vehicle[] }>) {
      state.vehicles = action.payload.vehicles;
    },
    addVehicle(state, action: PayloadAction<{ vehicle: Vehicle }>) {
      state.vehicles = [...state.vehicles, action.payload.vehicle];
    },
    editVehicle(state, action: PayloadAction<{ vehicle: Vehicle }>) {
      const { vehicle } = action.payload;
      const idx = state.vehicles.findIndex((v) => v.id === vehicle.id);
      if (idx === -1) {
        state.vehicles = [...state.vehicles, vehicle];
      } else {
        state.vehicles[idx] = vehicle;
      }
    },
    deleteVehicle(state, action: PayloadAction<{ id: number }>) {
      const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
      state.vehicles.splice(idx, 1);
    },
    getLoraDevices(state, action: PayloadAction<{ devices: LoraDevice[] }>) {
      state.loraDevices = action.payload.devices;
    },
    addLoraDevice(state, action: PayloadAction<{ device: LoraDevice }>) {
      state.loraDevices = [...state.loraDevices, action.payload.device];
    },
    editLoraDevice(state, action: PayloadAction<{ device: LoraDevice }>) {
      const { device } = action.payload;
      const idx = state.loraDevices.findIndex((d) => d.id === device.id);
      if (idx === -1) {
        state.loraDevices = [...state.loraDevices, device];
      } else {
        state.loraDevices[idx] = device;
      }
    },
    deleteLoraDevice(state, action: PayloadAction<{ id: number }>) {
      const idx = state.loraDevices.findIndex((d) => d.id === action.payload.id);
      state.loraDevices.splice(idx, 1);
    },
    getLatestLocations(
      state,
      action: PayloadAction<{ locations: { vehicle: Vehicle; location: VehicleLocation }[] }>
    ) {
      state.latestLocations = action.payload.locations;
    },
    setLoadingGet(state, action: PayloadAction<{ loading: boolean }>) {
      state.loadingGet = action.payload.loading;
    }
  }
});

export const { reducer } = slice;

export const getVehicles = (): AppThunk => async (dispatch) => {
  dispatch(slice.actions.setLoadingGet({ loading: true }));
  try {
    const vehicles = await api.get<Vehicle[]>('fleet/vehicles');
    dispatch(slice.actions.getVehicles({ vehicles }));
  } finally {
    dispatch(slice.actions.setLoadingGet({ loading: false }));
  }
};

export const addVehicle =
  (vehicle: Partial<Vehicle>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<Vehicle>('fleet/vehicles', vehicle);
    dispatch(slice.actions.addVehicle({ vehicle: result }));
  };

export const editVehicle =
  (id: number, vehicle: Partial<Vehicle>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<Vehicle>(`fleet/vehicles/${id}`, vehicle);
    dispatch(slice.actions.editVehicle({ vehicle: result }));
  };

export const deleteVehicle =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`fleet/vehicles/${id}`);
    dispatch(slice.actions.deleteVehicle({ id }));
  };

export const getLoraDevices = (): AppThunk => async (dispatch) => {
  const devices = await api.get<LoraDevice[]>('fleet/vehicles/lora-devices');
  dispatch(slice.actions.getLoraDevices({ devices }));
};

export const addLoraDevice =
  (device: Partial<LoraDevice>): AppThunk =>
  async (dispatch) => {
    const result = await api.post<LoraDevice>('fleet/vehicles/lora-devices', device);
    dispatch(slice.actions.addLoraDevice({ device: result }));
  };

export const editLoraDevice =
  (id: number, device: Partial<LoraDevice>): AppThunk =>
  async (dispatch) => {
    const result = await api.patch<LoraDevice>(`fleet/vehicles/lora-devices/${id}`, device);
    dispatch(slice.actions.editLoraDevice({ device: result }));
  };

export const deleteLoraDevice =
  (id: number): AppThunk =>
  async (dispatch) => {
    await api.deletes(`fleet/vehicles/lora-devices/${id}`);
    dispatch(slice.actions.deleteLoraDevice({ id }));
  };

export const getLatestLocations = (): AppThunk => async (dispatch) => {
  const locations = await api.get<{ vehicle: Vehicle; location: VehicleLocation }[]>(
    'fleet/vehicles/locations/latest'
  );
  dispatch(slice.actions.getLatestLocations({ locations }));
};

export default slice;
