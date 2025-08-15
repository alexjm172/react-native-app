import type { Articulo } from '../entities/Articulo';
import type { ArticuloRepository, GeoQuery } from '../repositories/ArticuloRepository';

export class GetArticulosByGeoUseCase {
  constructor(private repo: ArticuloRepository) {}
  async execute(params: GeoQuery): Promise<Articulo[]> {
    const limit = params.limit ?? 50;
    return this.repo.getByGeo({ ...params, limit });
  }
}