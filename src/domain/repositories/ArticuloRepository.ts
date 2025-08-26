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
  getByIds(ids: string[]): Promise<Articulo[]>;
  getImagePaths(categoria: string, id: string): Promise<string[]>;
  setImagePaths(categoria: string, id: string, paths: string[]): Promise<void>;
  updateImagesMeta(
    categoria: string,
    id: string,
    imagenes: string[],       
    imagenesPaths: string[],  
  ): Promise<void>;
  newId(categoria: string): Promise<string>;
}