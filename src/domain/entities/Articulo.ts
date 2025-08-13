import { Categoria } from "./enums/Categoria";
import { Estado } from "./enums/Estado";
import { Alquiler } from "./Alquiler";

export type Articulo = {
    id : string;
    idPropietario: string;
    nombre: string;
    categoria: Categoria;
    valoraciones: number[];
    estado: Estado;
    alquileres?: Alquiler[];
    imagenes: string[];
    precioPorDia?: number;
    precioPorHora?: number;
    precioPorSemana?: number;
    latitud?: number;
    longitud?: number;
    marca?: string;
    rango?:number;
};