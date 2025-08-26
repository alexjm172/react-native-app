import type { Articulo } from '../entities/Articulo';
import type { Alquiler } from '../entities/Alquiler';

export type PurchasedItem = {
  articulo: Articulo;
  alquiler: Alquiler;
};