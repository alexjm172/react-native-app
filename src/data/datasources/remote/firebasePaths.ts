import { collection, doc } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../core/config/FirebaseConfig';

const ROOT = 'articulos';
const SUB  = 'items';     
const ROOT_USERS = 'usuarios';
//AUTH

export const usersCollectionRef = () =>
  collection(FIRESTORE_DB, ROOT_USERS);

export const userDocRef = (uid: string) =>
  doc(usersCollectionRef(), uid);

//ARTICULOS

export const categoriasColRef = () =>
  collection(FIRESTORE_DB, ROOT);

export const categoriaDocRef = (categoriaId: string) =>
  doc(categoriasColRef(), categoriaId); 

export const itemsCollectionRef = (categoriaId: string) =>
  collection(categoriaDocRef(categoriaId), SUB);

export const itemDocRef = (categoriaId: string, itemId: string) =>
  doc(itemsCollectionRef(categoriaId), itemId);