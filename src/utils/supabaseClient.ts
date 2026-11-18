// ============================================================================
// ARCHIVO: src/utils/supabaseClient.ts
// DESCRIPCION: Adaptador de persistencia de datos para FitPulse Pro.
// Gestiona el almacenamiento local inmediato en el telefono (AsyncStorage)
// y deja preparada la conexion a la base de datos en la nube (Supabase SQL).
// ============================================================================

import { loadItem, saveItem } from './storage';

// Configuracion de conexion para Supabase Cloud (Plan Gratuito $0 USD).
// Si las variables de entorno estan vacias, la aplicacion utiliza automaticamente
// la base de datos local del dispositivo sin requerir conexion a internet.
export const SUPABASE_CONFIG = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Estructura que describe el resumen estadistico de cada tabla de la base de datos.
export interface DatabaseTableSummary {
  tableName: string;   // Nombre tecnico de la tabla SQL
  description: string; // Explicacion de lo que almacena la tabla
  rowCount: number;    // Cantidad de registros guardados actualmente
}

// Claves unicas utilizadas para guardar cada tabla dentro de la memoria persistente del telefono.
const DB_KEYS = {
  COMMUNITIES: 'fitpulse_db_communities_v1',   // Tabla de comunidades, coaches, rutinas y muros
  WALL_POSTS: 'fitpulse_db_wall_posts_v1',     // Tabla de publicaciones sociales
  MEMBERSHIPS: 'fitpulse_db_memberships_v1',   // Tabla de solicitudes de ingreso y miembros aprobados
  WORKOUT_LOGS: 'fitpulse_db_workout_logs_v1', // Tabla de entrenamientos terminados con el cronometro
};

/**
 * Guarda la lista completa de comunidades (incluyendo rutinas del coach, muro y solicitudes)
 * en el almacenamiento permanente del dispositivo.
 * @param communities Arreglo o estructura de comunidades actualizadas.
 */
export async function saveCommunitiesToDB<T>(communities: T): Promise<void> {
  await saveItem(DB_KEYS.COMMUNITIES, communities);
}

/**
 * Carga la lista de comunidades guardadas en el dispositivo.
 * Si es la primera vez que se abre la app, devuelve los datos iniciales por defecto.
 * @param fallback Lista inicial de comunidades de respaldo.
 */
export async function loadCommunitiesFromDB<T>(fallback: T): Promise<T> {
  return await loadItem(DB_KEYS.COMMUNITIES, fallback);
}
