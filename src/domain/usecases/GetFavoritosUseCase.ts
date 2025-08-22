import type { Articulo } from '../entities/Articulo';
import type { UserRepository } from '../repositories/UserRepository';
import type { ArticuloRepository } from '../repositories/ArticuloRepository';

export class GetFavoritosUseCase {
  constructor(
    private userRepo: UserRepository,
    private articuloRepo: ArticuloRepository
  ) {}

  async execute(uid: string): Promise<Articulo[]> {
    console.log('[GetFavUC] start uid =', uid);

    const user = await this.userRepo.getById(uid);
    const ids = user?.favoritos ?? [];
    console.log('[GetFavUC] favoritos ids →', ids);

    if (!ids.length) return [];

    const arts = await this.articuloRepo.getByIds(ids);
    console.log('[GetFavUC] fetched artículos =', arts.length);
    return arts;
  }
}