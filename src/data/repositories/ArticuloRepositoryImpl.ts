import {
  getDocs, getDoc, setDoc, deleteDoc,
  query, orderBy, startAt, endAt, limit as fsLimit,
} from 'firebase/firestore';
import { distanceBetween } from 'geofire-common';

import type { Articulo } from '../../domain/entities/Articulo';
import type { ArticuloRepository, GeoQuery } from '../../domain/repositories/ArticuloRepository';

import {
  itemsCollectionRef,
  itemDocRef,
  itemsCollectionGroupRef,
} from '../datasources/remote/firebasePaths';

import { articuloFromSnapshot, articuloToDoc } from '../mappers/articulo.mapper';

// helpers
const toRad = (deg: number) => (deg * Math.PI) / 180;
function computeBBox(lat: number, lng: number, radiusMeters: number) {
  const latDelta = radiusMeters / 111_000; // 1º ≈ 111km
  const lngDelta = radiusMeters / (111_320 * Math.cos(toRad(lat)) || 1);
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export class ArticuloRepositoryImpl implements ArticuloRepository {
  async getByCategoria(categoria: string): Promise<Articulo[]> {
    const snap = await getDocs(itemsCollectionRef(categoria));
    return snap.docs.map(articuloFromSnapshot);
  }

  async getById(categoria: string, id: string): Promise<Articulo | null> {
    const snap = await getDoc(itemDocRef(categoria, id));
    if (!snap.exists()) return null;
    return articuloFromSnapshot(snap);
  }

  async upsert(articulo: Articulo): Promise<void> {
    // SIN geohash: guardamos tal cual
    await setDoc(itemDocRef(articulo.categoria, articulo.id), articuloToDoc(articulo), { merge: true });
  }

  async delete(categoria: string, id: string): Promise<void> {
    await deleteDoc(itemDocRef(categoria, id));
  }

  async getByGeo({ latitude, longitude, radiusMeters, limit }: GeoQuery): Promise<Articulo[]> {
    const { minLat, maxLat, minLng, maxLng } = computeBBox(latitude, longitude, radiusMeters);

    // 1) Rango por latitud (una sola desigualdad) sobre el grupo /items
    const q = query(
      itemsCollectionGroupRef(),
      orderBy('latitud'),
      startAt(minLat),
      endAt(maxLat),
      fsLimit(Math.max(100, limit ?? 300))
    );

    const snap = await getDocs(q);

    // 2) Filtro en cliente por longitud y distancia real
    const center: [number, number] = [latitude, longitude];
    const out: Articulo[] = [];
    for (const doc of snap.docs) {
      const data: any = doc.data();
      const lat = data?.latitud;
      const lng = data?.longitud;
      if (typeof lat !== 'number' || typeof lng !== 'number') continue;
      if (lng < minLng || lng > maxLng) continue;

      const distKm = distanceBetween(center, [lat, lng]);
      if (distKm * 1000 <= radiusMeters) out.push(articuloFromSnapshot(doc));
    }

    return typeof limit === 'number' && limit > 0 ? out.slice(0, limit) : out;
  }
}