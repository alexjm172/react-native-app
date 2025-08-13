import { User } from '../entities/User';

export interface AuthRepository {
  signInWithEmail(email: string, password: string): Promise<User>;
  signUpWithEmail(nombre: string, email: string, password: string): Promise<User>;
  signOut(): Promise<void>;
  currentUser(): Promise<User | null>;
  observeAuth(onChange: (u: User | null) => void): () => void;
}