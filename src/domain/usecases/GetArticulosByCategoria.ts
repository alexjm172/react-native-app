import { Articulo } from "../entities/Articulo";
import { ArticuloRepository } from "../repositories/ArticuloRepository";

export class GetArticulosByCategoria {
  constructor(private repo: ArticuloRepository) {}
  execute(categoria: string): Promise<Articulo[]> {
    return this.repo.getByCategoria(categoria);
  }
}