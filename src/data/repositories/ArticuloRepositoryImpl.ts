import {
  getDocs, getDoc, setDoc, deleteDoc,
  query, orderBy, startAt, endAt, limit as fsLimit,
} from 'firebase/firestore';
import { distanceBetween } from 'geofire-common';
import { itemsCollectionRef, itemDocRef, itemsCollectionGroupRef } from '../datasources/remote/firebasePaths';
import { articuloFromSnapshot, articuloToDoc } from '../mappers/articulo.mapper';
import type { Articulo } from '../../domain/entities/Articulo';
import type { ArticuloRepository, GeoQuery } from '../../domain/repositories/ArticuloRepository';

// categorías EXACTAS en Firestore
const CATEGORY_DOC_IDS = ['Cocina','Deporte','Electricidad','Electrónica','Jardinería'] as const;

export class ArticuloRepositoryImpl implements ArticuloRepository {
  async getByCategoria(categoria: string): Promise<Articulo[]> {
    const snap = await getDocs(itemsCollectionRef(categoria));
    return snap.docs.map(articuloFromSnapshot);
  }

  async getById(categoria: string, id: string): Promise<Articulo | null> {
    const snap = await getDoc(itemDocRef(categoria, id));
    return snap.exists() ? articuloFromSnapshot(snap) : null;
  }

  async upsert(articulo: Articulo): Promise<void> {
    await setDoc(
      itemDocRef(articulo.categoria as string, articulo.id),
      { ...articuloToDoc(articulo), id: articulo.id }, // guardamos también `id`
      { merge: true }
    );
  }

  async delete(categoria: string, id: string): Promise<void> {
    await deleteDoc(itemDocRef(categoria, id));
  }

  async getByGeo({ latitude, longitude, radiusMeters, limit }: GeoQuery): Promise<Articulo[]> {
    const toRad = (d:number)=>d*Math.PI/180;
    const latDelta = radiusMeters/111_000;
    const lngDelta = radiusMeters/(111_320*Math.cos(toRad(latitude))||1);
    const minLat = latitude-latDelta, maxLat = latitude+latDelta;
    const minLng = longitude-lngDelta, maxLng = longitude+lngDelta;

    const q = query(
      itemsCollectionGroupRef(),
      orderBy('latitud'), startAt(minLat), endAt(maxLat),
      fsLimit(Math.max(100, limit ?? 300))
    );

    const snap = await getDocs(q);
    const center: [number,number] = [latitude, longitude];
    const out: Articulo[] = [];

    for (const d of snap.docs) {
      const data:any = d.data();
      const lat = data?.latitud, lng = data?.longitud;
      if (typeof lat !== 'number' || typeof lng !== 'number') continue;
      if (lng < minLng || lng > maxLng) continue;
      if (distanceBetween(center,[lat,lng])*1000 <= radiusMeters) out.push(articuloFromSnapshot(d));
    }
    return typeof limit === 'number' && limit > 0 ? out.slice(0, limit) : out;
  }

  // Favoritos: buscamos cada id en TODAS las categorías 
  async getByIds(ids: string[]): Promise<Articulo[]> {
    if (!ids.length) return [];
    const out: Articulo[] = [];

    for (const wantedId of ids) {
      let found: Articulo | null = null;
      for (const cat of CATEGORY_DOC_IDS) {
        const snap = await getDoc(itemDocRef(cat, wantedId));
        if (snap.exists()) { found = articuloFromSnapshot(snap); break; }
      }
      if (found) out.push(found);
    }
    return out;
  }
}