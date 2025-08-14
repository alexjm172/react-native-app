// Tipos y constantes compartidas para categorías

export const CATEGORY_IDS = [
  'jardineria',
  'cocina',
  'deporte',
  'electricidad',
  'electronica',
] as const;

export type CategoryId = typeof CATEGORY_IDS[number];

export type CategoryOption = { id: CategoryId; label: string };

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  jardineria: 'Jardinería',
  cocina: 'Cocina',
  deporte: 'Deporte',
  electricidad: 'Electricidad',
  electronica: 'Electrónica',
};

export const DEFAULT_CATEGORY: CategoryId = 'jardineria';

//lista de opciones para pickers
export const CATEGORY_OPTIONS: CategoryOption[] =
  CATEGORY_IDS.map(id => ({ id, label: CATEGORY_LABELS[id] }));

// Mapeo UI → Firestore (con acentos y mayúsculas)
const FIRESTORE_DOC_MAP: Record<CategoryId, string> = {
  jardineria: 'Jardinería',
  cocina: 'Cocina',
  deporte: 'Deporte',
  electricidad: 'Electricidad',
  electronica: 'Electrónica',
};
export const toFirestoreDocId = (id: CategoryId) => FIRESTORE_DOC_MAP[id];