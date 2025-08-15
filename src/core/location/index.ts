import Geolocation from 'react-native-geolocation-service';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Radio aproximado a partir del delta vertical del mapa */
export const radiusFromRegion = (r: Region) => {
  const halfKm = (r.latitudeDelta * 111_000) / 2; // 1º lat ≈ 111 km
  return clamp(halfKm, 500, 50_000); // 0.5–50 km
};

const KEY_LAST_REGION = 'last_region';

export async function saveRegion(r: Region) {
  try { await AsyncStorage.setItem(KEY_LAST_REGION, JSON.stringify(r)); } catch {}
}
async function loadRegion(): Promise<Region | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_LAST_REGION);
    return raw ? JSON.parse(raw) as Region : null;
  } catch { return null; }
}

/** Región por defecto si no hay permisos ni cache */
const FALLBACK: Region = {
  latitude: 40.4168,   // Madrid
  longitude: -3.7038,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export async function getInitialRegion(): Promise<Region> {
  // 1) si hay última región guardada, úsala ya
  const cached = await loadRegion();
  if (cached) return cached;

  // 2) pide/check permisos
  const perm = Platform.select({
    ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
  })!;

  let status = await check(perm);
  if (status === RESULTS.DENIED) status = await request(perm);

  if (status !== RESULTS.GRANTED) {
    // opcional: openSettings() si quieres forzar
    return FALLBACK;
  }

  // 3) localiza
  const pos = await new Promise<Geolocation.GeoPosition>((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000,
    });
  }).catch(() => null);

  if (!pos) return FALLBACK;

  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    latitudeDelta: 0.06,
    longitudeDelta: 0.06,
  };
}