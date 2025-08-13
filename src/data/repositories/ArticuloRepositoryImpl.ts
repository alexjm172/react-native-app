import { getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { Articulo } from '../../domain/entities/Articulo';
import { ArticuloRepository } from '../../domain/repositories/ArticuloRepository';
import { itemsCollectionRef, itemDocRef } from '../datasources/remote/firebasePaths';
import { articuloFromSnapshot, articuloToDoc } from '../mappers/articulo.mapper';

export class ArticuloRepositoryImpl implements ArticuloRepository {

  async getByCategoria(categoria: string): Promise<Articulo[]> {
    const snap = await getDocs(itemsCollectionRef(categoria));
    return snap.docs.map(articuloFromSnapshot);
  }

  async getById(categoria: string, id: string): Promise<Articulo | null> {
    const snap = await getDoc(itemDocRef(categoria, id));
    if (!snap.exists()) return null;
    return articuloFromSnapshot(snap);
  }

  async upsert(articulo: Articulo): Promise<void> {
    // Guardamos el doc exactamente como viene, con su id dentro
    await setDoc(itemDocRef(articulo.categoria, articulo.id), articuloToDoc(articulo), { merge: true });
  }

  async delete(categoria: string, id: string): Promise<void> {
    await deleteDoc(itemDocRef(categoria, id));
  }
}