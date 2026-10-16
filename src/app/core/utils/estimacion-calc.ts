/**
 * Regla 5 / 78 / 15 / 2 (Apéndice B, Anexo 2 de las Bases Integradas).
 * El dato de entrada son las HH de desarrollo + prueba unitaria, que equivalen al 78 % del total.
 */
export const PORCENTAJES = {
  analisis: 5,
  desarrollo: 78,
  pruebas: 15,
  documentacion: 2,
} as const;

export interface DistribucionHH {
  analisis: number;
  desarrollo: number;
  pruebas: number;
  documentacion: number;
  total: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Calcula la distribución por etapa. Cada etapa se redondea a 2 decimales y la
 * documentación absorbe la diferencia de redondeo, así la suma siempre coincide con el total.
 * Ejemplo: 78 → 5 / 78 / 15 / 2 = 100.
 */
export function calcularDistribucion(hhDesarrollo: number): DistribucionHH {
  const total = round2(hhDesarrollo / (PORCENTAJES.desarrollo / 100));
  const analisis = round2((total * PORCENTAJES.analisis) / 100);
  const pruebas = round2((total * PORCENTAJES.pruebas) / 100);
  const documentacion = round2(total - hhDesarrollo - analisis - pruebas);
  return { analisis, desarrollo: hhDesarrollo, pruebas, documentacion, total };
}
