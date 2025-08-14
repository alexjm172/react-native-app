
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