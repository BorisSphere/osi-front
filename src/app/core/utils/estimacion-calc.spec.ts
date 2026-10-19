import { calcularDistribucion } from './estimacion-calc';

describe('calcularDistribucion', () => {
  it('CA06: 78 HH de desarrollo → 100 HH = 5 / 78 / 15 / 2', () => {
    expect(calcularDistribucion(78)).toEqual({ analisis: 5, desarrollo: 78, pruebas: 15, documentacion: 2, total: 100 });
  });

  it('la suma de las etapas coincide con el total aunque haya redondeo', () => {
    for (const hh of [1, 7.5, 50, 123.45, 999]) {
      const d = calcularDistribucion(hh);
      const suma = Math.round((d.analisis + d.desarrollo + d.pruebas + d.documentacion) * 100) / 100;
      expect(suma).toBe(d.total);
    }
  });
});
