import type { Articulo } from '../entities/Articulo';
import type { ArticuloRepository } from '../repositories/ArticuloRepository';

export class GetArticulosByIds {
  constructor(private articuloRepo: ArticuloRepository) {}

  async execute(ids: string[]): Promise<Articulo[]> {
    if (!ids || ids.length === 0) return [];
    return this.articuloRepo.getByIds(ids);
  }
}