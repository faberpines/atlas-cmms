import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography
} from '@mui/material';
import DirectionsCarTwoToneIcon from '@mui/icons-material/DirectionsCarTwoTone';
import SpeedTwoToneIcon from '@mui/icons-material/SpeedTwoTone';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from '../../../store';
import { getLatestLocations } from '../../../slices/vehicle';
import Vehicle, { VehicleLocation } from '../../../models/owns/vehicle';

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const statusColors: Record<string, string> = {
  ACTIVE: '#57CA22',
  IN_MAINTENANCE: '#FFA319',
  OUT_OF_SERVICE: '#FF1943',
  RETIRED: '#888'
};

function vehicleIcon(status: string) {
  const color = statusColors[status] ?? '#1976d2';
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <circle cx="12" cy="12" r="11" fill="${color}" stroke="#fff" stroke-width="2"/>
      <path fill="#fff" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>`);
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

interface MarkerEntry {
  vehicle: Vehicle;
  location: VehicleLocation;
}

function AutoFitBounds({ markers }: { markers: MarkerEntry[] }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.location.latitude, m.location.longitude]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [markers]);
  return null;
}

function FleetMap() {
  const { t }: { t: any } = useTranslation();
  const dispatch = useDispatch();
  const { latestLocations, vehicles, loadingGet } = useSelector((state) => state.vehicles);

  useEffect(() => {
    dispatch(getLatestLocations());
  }, []);

  if (loadingGet) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" alignItems="center">
        <Chip size="small" sx={{ bgcolor: statusColors.ACTIVE, color: '#fff' }} label={t('active')} />
        <Chip size="small" sx={{ bgcolor: statusColors.IN_MAINTENANCE, color: '#fff' }} label={t('in_maintenance')} />
        <Chip size="small" sx={{ bgcolor: statusColors.OUT_OF_SERVICE, color: '#fff' }} label={t('out_of_service')} />
        <Chip size="small" sx={{ bgcolor: statusColors.RETIRED, color: '#fff' }} label={t('retired')} />
        <Divider orientation="vertical" flexItem />
        <Typography variant="body2" color="text.secondary">
          {latestLocations.length} / {vehicles.length} {t('vehicles_with_gps')}
        </Typography>
      </Stack>
      <Card sx={{ overflow: 'hidden' }}>
        <MapContainer
          center={[39.5, -98.35]}
          zoom={4}
          style={{ height: 600, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <AutoFitBounds markers={latestLocations} />
          {latestLocations.map((entry) => (
            <Marker
              key={entry.vehicle.id}
              position={[entry.location.latitude, entry.location.longitude]}
              icon={vehicleIcon(entry.vehicle.status)}
            >
              <Popup>
                <Stack spacing={0.5} sx={{ minWidth: 160 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DirectionsCarTwoToneIcon fontSize="small" />
                    <Typography variant="subtitle2" fontWeight={700}>
                      {entry.vehicle.name}
                    </Typography>
                  </Stack>
                  {entry.vehicle.assetNumber && (
                    <Typography variant="caption">#{entry.vehicle.assetNumber}</Typography>
                  )}
                  {entry.vehicle.licensePlate && (
                    <Typography variant="caption">🪪 {entry.vehicle.licensePlate}</Typography>
                  )}
                  {entry.location.speed != null && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <SpeedTwoToneIcon fontSize="small" />
                      <Typography variant="caption">
                        {Math.round(entry.location.speed)} km/h
                      </Typography>
                    </Stack>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {entry.location.recordedAt
                      ? new Date(entry.location.recordedAt).toLocaleString()
                      : ''}
                  </Typography>
                </Stack>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
    </Box>
  );
}

export default FleetMap;
