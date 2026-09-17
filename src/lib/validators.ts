import { z } from "zod";

/**
 * Percentual de carga de bateria. Regra de negócio: nunca aceitar valores
 * fora do intervalo 0-100 (ver Módulo de Baterias).
 */
export const percentSchema = z.coerce
  .number()
  .int("Informe um número inteiro.")
  .min(0, "A carga não pode ser inferior a 0%.")
  .max(100, "A carga não pode ser superior a 100%.");

/** Regra de negócio: o fim de um período nunca pode ser anterior/igual ao início. */
export function isValidPeriod(start: Date, end: Date): boolean {
  return end.getTime() > start.getTime();
}

/** Converte "HH:mm" em minutos desde a meia-noite, para cálculo de duração. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
