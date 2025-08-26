import {
  getDocs, getDoc, setDoc, deleteDoc,
  query, orderBy, startAt, endAt, limit as fsLimit,
  updateDoc,
} from 'firebase/firestore';
import { distanceBetween } from 'geofire-common';
import { doc } from 'firebase/firestore';

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

  /** ← ampliado para admitir imágenes/paths */
  async upsert(
    articulo: Articulo,
    extra?: { imagenes?: string[]; imagenesPaths?: string[] }
  ): Promise<void> {
    const payload: any = {
      ...articuloToDoc(articulo),
      id: articulo.id,
    };
    if (extra?.imagenes)      payload.imagenes = extra.imagenes;
    if (extra?.imagenesPaths) payload.imagenesPaths = extra.imagenesPaths;

    await setDoc(itemDocRef(articulo.categoria as any, articulo.id), payload, { merge: true });
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

  /** Favoritos / listados por ids (buscando en todas las categorías) */
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

  async getImagePaths(categoria: string, id: string): Promise<string[]> {
    const snap = await getDoc(itemDocRef(categoria, id));
    if (!snap.exists()) return [];
    const data: any = snap.data();
    return Array.isArray(data?.imagenesPaths) ? data.imagenesPaths : [];
  }

  async setImagePaths(categoria: string, id: string, paths: string[]) {
    await updateDoc(itemDocRef(categoria, id), { imagenesPaths: paths });
  }

  async updateImagesMeta(
    categoria: string,
    id: string,
    imagenes: string[],
    imagenesPaths: string[],
  ): Promise<void> {
    await setDoc(
      itemDocRef(categoria, id),
      { imagenes, imagenesPaths },
      { merge: true }
    );
  }

  async newId(categoria: string): Promise<string> {
    const d = doc(itemsCollectionRef(categoria));
    return d.id;
  }
}