import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  type StorageReference,
} from 'firebase/storage';
import type { StorageRepository } from '../../domain/repositories/StorageRepository';
import { Buffer } from 'buffer'; // RN tiene polyfill de Buffer vía Metro

export class StorageRepositoryImpl implements StorageRepository {
  private storage = getStorage();

  /** Sube desde un file:// o http(s):// usando fetch → Blob; fallback a Expo FS si hiciera falta */
  private async uploadFromUri(localUri: string, r: StorageReference) {
    try {
      const res = await fetch(localUri);
      const blob = await res.blob();
      await uploadBytes(r, blob);
    } catch (err) {
      // Fallback para entornos donde fetch(file://) no funcione: Expo
      try {
        const FileSystem = require('expo-file-system');
        const base64: string = await FileSystem.readAsStringAsync(localUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const bytes = Buffer.from(base64, 'base64'); 
        await uploadBytes(r, bytes);
      } catch (err2) {
        throw err2;
      }
    }
  }

  async upload(localUri: string, destPath: string) {
    const r = ref(this.storage, destPath);

    if (localUri.startsWith('data:')) {
      const base64 = localUri.split(',')[1] ?? '';
      const bytes = Buffer.from(base64, 'base64');
      await uploadBytes(r, bytes);
    } else {
      await this.uploadFromUri(localUri, r);
    }

    const url = await getDownloadURL(r);
    return { url, path: destPath };
  }

  async delete(path: string) {
    await deleteObject(ref(this.storage, path));
  }

  /** Lista rutas completas bajo un "prefijo/carpeta" */
  async list(prefix: string): Promise<string[]> {
    const res = await listAll(ref(this.storage, prefix));
    return res.items.map(i => i.fullPath); // p. ej. "articulos/Cocina/ID/xxx.jpg"
  }
}