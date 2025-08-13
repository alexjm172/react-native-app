import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';
import { Articulo } from '../../domain/entities/Articulo';

// Guardamos el doc tal cual (incluyendo su id como campo si así lo quieres)
export const articuloToDoc = (a: Articulo): Articulo => a;

// Desde Firestore → si el doc trae un id en sus campos, el id del snapshot manda
export const articuloFromSnapshot = (
  snap: QueryDocumentSnapshot | DocumentSnapshot
): Articulo => {
  const data = snap.data() as Articulo | undefined;
  if (!data) {
    // si el doc no existe, esto no debería llamarse, pero por si acaso
    return { id: snap.id } as Articulo;
  }
  return { ...data, id: snap.id };
};