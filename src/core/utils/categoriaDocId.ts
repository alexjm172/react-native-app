import { Categoria } from '../../domain/entities/enums/Categoria';

export const categoriaDocId = (c: Categoria | string): string => {
  if (!c) throw new Error('Categoría indefinida');
  if (typeof c === 'string') return c.trim().toLowerCase();

  switch (c) {
    case Categoria.COCINA:        return 'cocina';
    case Categoria.DEPORTE:       return 'deporte';
    case Categoria.ELECTRICIDAD:  return 'electricidad';
    case Categoria.ELECTRONICA:   return 'electronica';
    case Categoria.JARDINERIA:    return 'jardineria';
    default:
      throw new Error(`Categoría no soportada: ${c as unknown as string}`);
  }
};