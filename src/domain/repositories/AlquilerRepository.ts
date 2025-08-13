import type { Alquiler } from "../entities/Alquiler";

export interface AlquilerRepository {
  getById(id: string): Promise<Alquiler | null>;
  create(alquiler: Alquiler): Promise<string>;
  update(id: string, partial: Partial<Alquiler>): Promise<void>;
  listByUsuario(userId: string): Promise<Alquiler[]>;
  listByArticulo(articuloId: string): Promise<Alquiler[]>;
}