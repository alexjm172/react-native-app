import type { Alquiler } from '../entities/Alquiler';

export type CreateAlquilerParams = {
  categoriaDocId: string; 
  articuloId: string;
  userId: string;
  fechaDesde: Date;
  fechaHasta: Date;
  importe: number;
};

/**
 * Repo mínimo: una única operación "create" que:
 *  1) añade el alquiler al array `alquileres` del artículo
 *  2) mete el id del alquiler en `usuarios/{uid}.compras` (arrayUnion)
 * Se hace todo en una transacción.
 */
export interface AlquilerRepository {
  create(params: CreateAlquilerParams): Promise<Alquiler>;
}