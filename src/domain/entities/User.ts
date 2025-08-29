import { Categoria } from './enums/Categoria';

export type User = {
  id: string;
  nombre: string;
  email: string;
  preferencias: Categoria[];
  alquileres?: string[];     // ids
  favoritos: string[];       // ids de artículos
  articulos: string[];       // ids publicados por el usuario
  compras: string[];         // compras realizadas
  newUser: boolean;
};