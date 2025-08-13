import { Articulo } from "../entities/Articulo";

export interface ArticuloRepository {
  getByCategoria(categoria: string): Promise<Articulo[]>;
  getById(categoria: string, id: string): Promise<Articulo | null>;
  upsert(articulo: Articulo): Promise<void>;
  delete(categoria: string, id: string): Promise<void>;
}