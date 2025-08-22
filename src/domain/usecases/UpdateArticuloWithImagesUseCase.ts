import type { Articulo } from '../entities/Articulo';
import type { ArticuloRepository } from '../repositories/ArticuloRepository';
import type { StorageRepository } from '../repositories/StorageRepository';

type Params = {
  base: Articulo;               // estado antes de editar
  updated: Articulo;            // estado tras editar (sin cerrar imágenes)
  addLocalUris: string[];       // nuevas locales a subir
  keepUrls: string[];           // URLs que se mantienen
  removeUrls: string[];         // URLs a eliminar
};

export class UpdateArticuloWithImagesUseCase {
  constructor(
    private articuloRepo: ArticuloRepository,
    private storageRepo: StorageRepository
  ) {}

  async execute({ base, updated, addLocalUris, keepUrls, removeUrls }: Params): Promise<Articulo> {
    // 1) Mapear URL→path actuales (para poder borrar del Storage las que quitas)
    const currentPaths = await this.articuloRepo.getImagePaths(base.categoria as any, base.id);
    const urlToPath = new Map<string, string | undefined>();
    (base.imagenes ?? []).forEach((u, i) => urlToPath.set(u, currentPaths?.[i]));

    // 2) Borrar en Storage las que se eliminan
    for (const url of removeUrls) {
      const p = urlToPath.get(url);
      if (p) {
        try { await this.storageRepo.delete(p); } catch {}
      }
    }

    // 3) Subir nuevas
    const uploadedUrls: string[] = [];
    const uploadedPaths: string[] = [];
    let idx = 0;
    for (const local of addLocalUris) {
      const dest = `articulos/${updated.categoria}/${updated.id}/${Date.now()}-${idx++}.jpg`;
      const { url, path } = await this.storageRepo.upload(local, dest);
      uploadedUrls.push(url);
      uploadedPaths.push(path);
    }

    // 4) Construir arrays finales (manteniendo paths de las que conservas)
    const keptPaths: string[] = [];
    keepUrls.forEach(u => keptPaths.push(urlToPath.get(u) ?? ''));

    const finalImagenes = [...keepUrls, ...uploadedUrls];
    const finalPaths    = [...keptPaths, ...uploadedPaths];

    const finalArticulo: Articulo = { ...updated, imagenes: finalImagenes };

    // 5) Guardar el doc en la NUEVA categoría
    await this.articuloRepo.upsert(finalArticulo);

    // 6) Si la categoría cambió, borra el doc antiguo para no dejar duplicados
    if (base.categoria !== finalArticulo.categoria) {
      await this.articuloRepo.delete(base.categoria as any, base.id);
    }

    // 7) (Opcional) si guardas los paths en Firestore, añade un método para persistirlos.
    //    Ej: await this.articuloRepo.setImagePaths(finalArticulo.categoria as any, finalArticulo.id, finalPaths);

    return finalArticulo;
  }
}