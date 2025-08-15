import { Articulo } from "../entities/Articulo";


export type GeoQuery = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
  limit?: number;
};

export interface ArticuloRepository {
  getByCategoria(categoria: string): Promise<Articulo[]>;
  getById(categoria: string, id: string): Promise<Articulo | null>;
  upsert(articulo: Articulo): Promise<void>;
  delete(categoria: string, id: string): Promise<void>;
  getByGeo(q: GeoQuery): Promise<Articulo[]>;
}