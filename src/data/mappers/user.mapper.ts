// src/data/mappers/user.mapper.ts
import { User } from '../../domain/entities/User';

type UserDoc = Omit<User, 'id'>;

export const userToDoc = ({ id, ...rest }: User): UserDoc => rest;
export const userFromDoc = (id: string, data: UserDoc): User => ({ id, ...data });

// Doc por defecto al registrarse:
export const defaultUserDoc = (u: { uid: string; email: string; nombre?: string }): User => ({
  id: u.uid,
  nombre: u.nombre ?? '',
  email: u.email,
  preferencias: [],
  alquileres: [],
  favoritos: [],
  articulos: [],
  compras: [],
  newUser: true,
});