import { User } from "../entities/User";

export interface UserRepository {
  getById(userId: string): Promise<User | null>;
  upsert(user: User): Promise<void>;
  setFavorito(userId: string, articuloId: string, activar: boolean): Promise<void>;
}