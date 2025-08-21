import type { UserRepository } from '../repositories/UserRepository';

export class ToggleFavoriteUseCase {
  constructor(private repo: UserRepository) {}

  /*
    Alterna favorito y devuelve el nuevo estado (true si quedó como favorito).
   */
  async execute(uid: string, articuloId: string): Promise<boolean> {
    const user = await this.repo.getById(uid);
    const yaEsFav = !!user?.favoritos?.includes(articuloId);
    const activar = !yaEsFav;
    await this.repo.setFavorito(uid, articuloId, activar);
    return activar;
  }
}