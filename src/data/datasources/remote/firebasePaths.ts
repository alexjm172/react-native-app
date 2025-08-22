import { collection, collectionGroup, doc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../core/config/FirebaseConfig';
import { categoriaDocId } from '../../../core/utils/categoriaDocId';

// Colecciones raíz
const ROOT_ARTICULOS = 'articulos' as const; 
const SUB_ITEMS      = 'items'      as const; 
const ROOT_USUARIOS  = 'usuarios'   as const;

// ===== Exporta la lista canónica de categorías (tal como existen en Firestore)
export const CATEGORY_DOC_IDS = [
  'Cocina',
  'Deporte',
  'Electricidad',
  'Electrónica',
  'Jardinería',
] as const;

export type CategoryDocId = typeof CATEGORY_DOC_IDS[number];

// =======================
// AUTH (usuarios)
// =======================
export const usersCollectionRef = () =>
  collection(FIRESTORE_DB, ROOT_USUARIOS);

export const userDocRef = (uid: string) =>
  doc(usersCollectionRef(), uid);

// =======================
// ARTÍCULOS
// Estructura: articulos/{Categoría}/items/{itemId}
// =======================

// Colección de categorías (raíz)
export const categoriasColRef = () =>
  collection(FIRESTORE_DB, ROOT_ARTICULOS);

// Documento de categoría (acepta enum, minúsculas, etc. y normaliza a “Cocina”, “Jardinería”, …)
export const categoriaDocRef = (categoria: string) =>
  doc(categoriasColRef(), categoriaDocId(categoria));

// Subcolección items dentro de una categoría (la entrada se normaliza)
export const itemsCollectionRef = (categoria: string) =>
  collection(categoriaDocRef(categoria), SUB_ITEMS);

// Documento de item por categoría + id (categoría se normaliza)
export const itemDocRef = (categoria: string, itemId: string) =>
  doc(itemsCollectionRef(categoria), itemId);

// Group query: todos los “items” bajo todas las categorías
export const itemsCollectionGroupRef = () =>
  collectionGroup(FIRESTORE_DB, SUB_ITEMS);