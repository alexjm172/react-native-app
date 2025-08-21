import { getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { User } from '../../domain/entities/User';
import type { UserRepository } from '../../domain/repositories/UserRepository';
import { userDocRef } from '../datasources/remote/firebasePaths';

export class UserRepositoryImpl implements UserRepository {
  async getById(userId: string): Promise<User | null> {
    const snap = await getDoc(userDocRef(userId));
    return snap.exists() ? (snap.data() as User) : null;
  }

  async upsert(user: User): Promise<void> {
    await setDoc(userDocRef(user.id), user, { merge: true });
  }

  async setFavorito(userId: string, articuloId: string, activar: boolean): Promise<void> {
    const ref = userDocRef(userId);
    if (activar) {
      await updateDoc(ref, { favoritos: arrayUnion(articuloId) });
    } else {
      await updateDoc(ref, { favoritos: arrayRemove(articuloId) });
    }
  }
}