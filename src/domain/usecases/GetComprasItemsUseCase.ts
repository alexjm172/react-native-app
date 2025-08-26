import type { UserRepository } from '../repositories/UserRepository';
import type { ArticuloRepository } from '../repositories/ArticuloRepository';
import type { PurchasedItem } from '../entities/PurchasedItem';
import type { Articulo } from '../entities/Articulo';

const CATEGORY_DOC_IDS = ['Cocina','Deporte','Electricidad','Electrónica','Jardinería'] as const;

const toDate = (x: any): Date => {
  if (!x) return new Date(NaN);
  if (typeof x === 'string' || typeof x === 'number') return new Date(x);
  if (typeof x?.toDate === 'function') return x.toDate();
  return new Date(x);
};

export class GetComprasItemsUseCase {
  constructor(
    private userRepo: UserRepository,
    private articuloRepo: ArticuloRepository
  ) {}

  /** Devuelve pares (artículo, alquiler) para todos los alquileres del usuario */
  async execute(uid: string): Promise<PurchasedItem[]> {
    const user = await this.userRepo.getById(uid);
    const wanted = Array.isArray(user?.compras) ? user!.compras : [];
    if (wanted.length === 0) return [];

    const wantedSet = new Set(wanted);
    const out: PurchasedItem[] = [];

    for (const cat of CATEGORY_DOC_IDS) {
      const arts: Articulo[] = await this.articuloRepo.getByCategoria(cat);
      for (const a of arts) {
        const alqs = Array.isArray(a.alquileres) ? a.alquileres : [];
        for (const alq of alqs) {
          if (alq?.idAlquiler && wantedSet.has(alq.idAlquiler)) {
            out.push({
              articulo: a,
              alquiler: {
                ...alq,
                fechaDesde: toDate(alq.fechaDesde),
                fechaHasta: toDate(alq.fechaHasta),
              },
            });
          }
        }
      }
    }

    // Ordena por fechaDesde descendente
    out.sort((x, y) => +y.alquiler.fechaDesde - +x.alquiler.fechaDesde);
    return out;
  }
}