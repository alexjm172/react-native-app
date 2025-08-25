import type { Articulo } from '../entities/Articulo';
import type { Alquiler } from '../entities/Alquiler';
import type { AlquilerRepository } from '../repositories/AlquilerRepository';

export class CreateAlquilerUseCase {
  constructor(private repo: AlquilerRepository) {}

  /**
   * Calcula el importe (ignorando tarifas 0/null/undefined)
   * y crea el alquiler de forma atómica.
   */
  async execute(input: {
    articulo: Articulo;
    userId: string;
    startISO: string; // YYYY-MM-DD
    endISO: string;   // YYYY-MM-DD
  }): Promise<Alquiler> {
    const { articulo, userId, startISO, endISO } = input;

    const start = new Date(startISO);
    const end   = new Date(endISO);
    if (isNaN(+start) || isNaN(+end)) throw new Error('Rango de fechas inválido');
    if (end < start) throw new Error('La fecha fin no puede ser anterior al inicio');

    // cálculo de importe (mismas reglas que en tu VM)
    const ms = +new Date(endISO) - +new Date(startISO);
    const days  = Math.ceil(ms / (24 * 3600 * 1000));
    const hours = Math.ceil(ms / (3600 * 1000));

    const hasWeek = articulo?.precioPorSemana != null && articulo.precioPorSemana > 0;
    const hasDay  = articulo?.precioPorDia    != null && articulo.precioPorDia    > 0;
    const hasHour = articulo?.precioPorHora   != null && articulo.precioPorHora   > 0;

    let importe = 0;
    if (days >= 7 && hasWeek) {
      const weeks = Math.floor(days / 7);
      importe += weeks * (articulo.precioPorSemana ?? 0);
      const restDays = days - weeks * 7;
      if (restDays > 0 && hasDay) importe += restDays * (articulo.precioPorDia ?? 0);
    } else if (days >= 1 && hasDay) {
      importe = days * (articulo.precioPorDia ?? 0);
    } else if (hasHour) {
      importe = hours * (articulo.precioPorHora ?? 0);
    } else {
      throw new Error('El artículo no tiene tarifa válida para el rango seleccionado');
    }

    const categoriaDocId = String(articulo.categoria); // ya viene con mayúsculas/tildes

    return this.repo.create({
      categoriaDocId,
      articuloId: articulo.id,
      userId,
      fechaDesde: start,
      fechaHasta: end,
      importe,
    });
  }
}