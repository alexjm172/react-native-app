import { runTransaction, arrayUnion } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../core/config/FirebaseConfig';
import { itemDocRef, userDocRef } from '../datasources/remote/firebasePaths';
import type { AlquilerRepository, CreateAlquilerParams } from '../../domain/repositories/AlquilerRepository';
import type { Alquiler } from '../../domain/entities/Alquiler';

const genId = () =>
  (globalThis.crypto?.randomUUID?.() ??
    Math.random().toString(36).slice(2) + Date.now().toString(36));

export class AlquilerRepositoryImpl implements AlquilerRepository {
  async create(params: CreateAlquilerParams): Promise<Alquiler> {
    const { categoriaDocId, articuloId, userId, fechaDesde, fechaHasta, importe } = params;

    const artRef = itemDocRef(categoriaDocId, articuloId);
    const usrRef = userDocRef(userId);

    const nuevo: Alquiler = {
      idAlquiler: genId(),
      idUsuario: userId,
      fechaDesde,
      fechaHasta,
      valoracion: 0,
      importe,
    };

    await runTransaction(FIRESTORE_DB, async (tx) => {
      const artSnap = await tx.get(artRef);
      if (!artSnap.exists()) throw new Error('Artículo no encontrado');

      const data = artSnap.data() as any;
      const alquileres: any[] = Array.isArray(data?.alquileres) ? [...data.alquileres] : [];

      // Validación de solapes dentro de la transacción
      const A = new Date(fechaDesde);
      const B = new Date(fechaHasta);
      for (const alq of alquileres) {
        const d1 = alq?.fechaDesde?.toDate ? alq.fechaDesde.toDate() : new Date(alq.fechaDesde);
        const d2 = alq?.fechaHasta?.toDate ? alq.fechaHasta.toDate() : new Date(alq.fechaHasta);
        if (!d1 || !d2) continue;
        if (A <= d2 && B >= d1) throw new Error('El artículo ya está alquilado en parte del rango');
      }

      alquileres.push(nuevo);
      tx.update(artRef, { alquileres });
      tx.set(usrRef, { compras: arrayUnion(nuevo.idAlquiler) }, { merge: true });
    });

    return nuevo;
  }
}