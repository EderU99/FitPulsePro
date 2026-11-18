// ============================================================================
// ARCHIVO: src/utils/storage.ts
// DESCRIPCION: Funciones utilitarias para guardar datos en la memoria del
// telefono (AsyncStorage), calcular la fuerza maxima (1RM) y formatear relojes.
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache en memoria RAM por si el almacenamiento fisico del dispositivo tarda en responder.
const memoryCache: Record<string, string> = {};

/**
 * Convierte cualquier objeto o arreglo a formato JSON y lo guarda permanentemente
 * en la memoria del dispositivo bajo la clave indicada.
 */
export async function saveItem<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  memoryCache[key] = raw;
  try {
    await AsyncStorage.setItem(key, raw);
  } catch {
    // Si ocurre un error de permisos en el dispositivo, se conserva en memoryCache
  }
}

/**
 * Lee un valor guardado en la memoria del dispositivo y lo convierte de JSON a su tipo original.
 * Si no existe todavia, devuelve el valor por defecto (fallback).
 */
export async function loadItem<T>(key: string, fallback: T): Promise<T> {
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch {
    if (memoryCache[key]) {
      return JSON.parse(memoryCache[key]) as T;
    }
  }
  return fallback;
}

/**
 * Calcula la repeticion maxima estimada (1RM) utilizando la formula cientifica de Epley:
 * 1RM = Peso * (1 + Repeticiones / 30).
 * Sirve para detectar cuando el atleta rompe un nuevo record personal de fuerza.
 */
export function calculateEpley1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return Math.round(weightKg);
  return Math.round(weightKg * (1 + reps / 30));
}

/**
 * Convierte una cantidad total de segundos en formato de reloj digital MM:SS (ej. 04:35).
 */
export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const mm = mins < 10 ? `0${mins}` : `${mins}`;
  const ss = secs < 10 ? `0${secs}` : `${secs}`;
  return `${mm}:${ss}`;
}
