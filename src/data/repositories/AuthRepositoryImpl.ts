// src/data/repositories/AuthRepositoryImpl.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  User as FBUser,
} from 'firebase/auth';
import { getDoc, setDoc } from 'firebase/firestore';

import { FIREBASE_AUTH } from '../../core/config/FirebaseConfig';
import { AuthRepository } from '../../domain/repositories/AuthRepository';
import { userDocRef } from '../datasources/remote/firebasePaths';
import { defaultUserDoc, userFromDoc, userToDoc } from '../mappers/user.mapper';
import type { User } from '../../domain/entities/User';

/** Lee el perfil y, si falta, lo crea en Firestore con valores por defecto. */
async function fbToDomainEnsure(fb: FBUser | null): Promise<User | null> {
  if (!fb) return null;

  const ref = userDocRef(fb.uid);
  let snap = await getDoc(ref);

  if (!snap.exists()) {
    const fallback = defaultUserDoc({
      uid: fb.uid,
      email: fb.email ?? '',
      nombre: fb.displayName ?? '',
    });
    await setDoc(ref, userToDoc(fallback), { merge: true });
    snap = await getDoc(ref);
  }

  return userFromDoc(fb.uid, snap.data() as any);
}

export class AuthRepositoryImpl implements AuthRepository {
  async signInWithEmail(email: string, password: string): Promise<User> {
    const cr = await signInWithEmailAndPassword(FIREBASE_AUTH, email, password);
    const u = await fbToDomainEnsure(cr.user);
    if (!u) throw new Error('Perfil de usuario no encontrado.');
    return u;
  }

  async signUpWithEmail(nombre: string, email: string, password: string): Promise<User> {
    const cr = await createUserWithEmailAndPassword(FIREBASE_AUTH, email, password);
    try { await updateProfile(cr.user, { displayName: nombre }); } catch {}
    // Creamos explícitamente el doc (además de garantizarlo en el observe)
    const u = defaultUserDoc({ uid: cr.user.uid, email, nombre });
    await setDoc(userDocRef(cr.user.uid), userToDoc(u), { merge: true });
    return u;
  }

  async signOut(): Promise<void> {
    await FIREBASE_AUTH.signOut();
  }

  async currentUser(): Promise<User | null> {
    return fbToDomainEnsure(FIREBASE_AUTH.currentUser);
  }

  observeAuth(onChange: (u: User | null) => void): () => void {
    return onAuthStateChanged(FIREBASE_AUTH, (fb) => {
      (async () => {
        try {
          const u = await fbToDomainEnsure(fb);
          onChange(u);
        } catch (e) {
          console.warn('[observeAuth] error', e);
          onChange(null); // notificamos siempre
        }
      })();
    });
  }
}