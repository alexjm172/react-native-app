// src/data/datasources/remote/firebasePaths.ts
import { collection, collectionGroup, doc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../core/config/FirebaseConfig';

const ROOT = 'articulos' as const;
const SUB  = 'items' as const;
const ROOT_USERS = 'usuarios' as const;

// =======================
// AUTH (usuarios)
// =======================
export const usersCollectionRef = () =>
  collection(FIRESTORE_DB, ROOT_USERS);

export const userDocRef = (uid: string) =>
  doc(usersCollectionRef(), uid);

// =======================
// ARTÍCULOS
// Estructura: articulos/{categoria}/items/{itemId}
// =======================
export const categoriasColRef = () =>
  collection(FIRESTORE_DB, ROOT);

export const categoriaDocRef = (categoriaId: string) =>
  doc(categoriasColRef(), categoriaId);

export const itemsCollectionRef = (categoriaId: string) =>
  collection(categoriaDocRef(categoriaId), SUB);

export const itemDocRef = (categoriaId: string, itemId: string) =>
  doc(itemsCollectionRef(categoriaId), itemId);

// collectionGroup para consultar TODOS los items de TODAS las categorías
export const itemsCollectionGroupRef = () =>
  collectionGroup(FIRESTORE_DB, SUB);