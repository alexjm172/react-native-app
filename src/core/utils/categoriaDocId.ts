import { Categoria } from '../../domain/entities/enums/Categoria';

export const categoriaDocId = (c: Categoria | string): string => {
  if (!c) throw new Error('Categoría indefinida');

  if (typeof c === 'string') {
    const k = c.trim().toLowerCase();
    switch (k) {
      case 'cocina':        return 'Cocina';
      case 'deporte':       return 'Deporte';
      case 'electricidad':  return 'Electricidad';
      case 'electronica':   return 'Electrónica';
      case 'jardineria':    return 'Jardinería';
      default:              return c; // ya viene bien (“Cocina”, “Jardinería”, etc.)
    }
  }

  switch (c) {
    case Categoria.COCINA:        return 'Cocina';
    case Categoria.DEPORTE:       return 'Deporte';
    case Categoria.ELECTRICIDAD:  return 'Electricidad';
    case Categoria.ELECTRONICA:   return 'Electrónica';
    case Categoria.JARDINERIA:    return 'Jardinería';
    default:
      throw new Error(`Categoría no soportada: ${String(c)}`);
  }
};