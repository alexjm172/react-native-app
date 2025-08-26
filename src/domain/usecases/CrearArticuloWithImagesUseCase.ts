import type { Articulo } from '../entities/Articulo';
import type { Categoria } from '../entities/enums/Categoria';
import type { ArticuloRepository } from '../repositories/ArticuloRepository';
import type { StorageRepository } from '../repositories/StorageRepository';
import type { UserRepository } from '../repositories/UserRepository';

type CreateParams = {
  ownerUid: string;
  data: {
    categoria: Categoria;
    nombre: string;
    marca?: string;
    estado: any;
    precioPorDia?: number;
    precioPorHora?: number;
    precioPorSemana?: number;
    latitud: number;
    longitud: number;
  };
  addLocalUris: string[]; // imágenes locales (galería/cámara)
};

export class CreateArticuloWithImagesUseCase {
  constructor(
    private articuloRepo: ArticuloRepository,
    private storageRepo: StorageRepository,
    private userRepo: UserRepository
  ) {}

  async execute({ ownerUid, data, addLocalUris }: CreateParams): Promise<Articulo> {
    // 1) id nuevo por categoría
    const id = await this.articuloRepo.newId(String(data.categoria));

    // 2) subidas
    const urls: string[] = [];
    const paths: string[] = [];
    let i = 0;
    for (const local of addLocalUris) {
      const dest = `articulos/${data.categoria}/${id}/${Date.now()}-${i++}.jpg`;
      const { url, path } = await this.storageRepo.upload(local, dest);
      urls.push(url); paths.push(path);
    }

    // 3) documento Articulo
    const articulo: Articulo = {
      id,
      idPropietario: ownerUid,
      nombre: data.nombre.trim(),
      categoria: data.categoria,
      valoraciones: [],
      estado: data.estado,
      alquileres: [],
      imagenes: urls,
      precioPorDia: data.precioPorDia,
      precioPorHora: data.precioPorHora,
      precioPorSemana: data.precioPorSemana,
      latitud: data.latitud,
      longitud: data.longitud,
      marca: data.marca?.trim() || undefined,
    };

    // 4) persistencia
    await this.articuloRepo.upsert(articulo);
    await this.articuloRepo.updateImagesMeta(String(articulo.categoria), articulo.id, urls, paths);

    // 5) vincular al usuario (añadir id al array `articulos`)
    await this.userRepo.addArticulo(ownerUid, articulo.id);

    return articulo;
  }
}