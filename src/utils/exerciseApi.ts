// ============================================================================
// ARCHIVO: src/utils/exerciseApi.ts
// DESCRIPCION: Servicio de conexion a catalogos abiertos y gratuitos de ejercicios.
// Obtiene secuencias fotograficas reales de inicio y fin de cada movimiento
// desde el CDN de Free-Exercise-DB (+870 ejercicios) y videos desde Wger API.
// ============================================================================

// Estructura de datos para el material visual y tecnico de un ejercicio de la API.
export interface ApiExerciseMedia {
  id: string;             // Identificador unico del ejercicio en el catalogo
  name: string;           // Nombre del ejercicio
  muscleGroup: string;    // Musculo principal trabajado
  equipment: string;      // Equipo requerido (barra, mancuerna, peso corporal, polea)
  videoUrl?: string;      // URL opcional de video demostrativo en formato MP4
  imageStartUrl: string;  // Fotografia real de la posicion inicial del movimiento (0.jpg)
  imageEndUrl: string;    // Fotografia real de la posicion final o contraccion (1.jpg)
  instructions: string[]; // Lista de pasos para ejecutar la tecnica correctamente
}

// URL base del servidor CDN gratuito en GitHub que aloja las imagenes de los ejercicios.
const FREE_EX_CDN =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

// Mapa que relaciona los identificadores internos de nuestra aplicacion
// con el nombre exacto de la carpeta en el servidor de imagenes Free-Exercise-DB.
export const VERIFIED_API_MEDIA: Record<
  string,
  { slug: string; fallbackMp4?: string }
> = {
  'ex-bench': {
    slug: 'Barbell_Bench_Press_-_Medium_Grip',
  },
  'ex-incline-db': {
    slug: 'Incline_Dumbbell_Press',
  },
  'ex-shoulder-press': {
    slug: 'Seated_Dumbbell_Press',
  },
  'ex-lat-raise': {
    slug: 'Side_Lateral_Raise',
  },
  'ex-tricep-rope': {
    slug: 'Triceps_Pushdown_-_Rope_Attachment',
  },
  'ex-lat-pulldown': {
    slug: 'Wide-Grip_Lat_Pulldown',
  },
  'ex-barbell-row': {
    slug: 'Bent_Over_Barbell_Row',
  },
  'ex-incline-curl': {
    slug: 'Incline_Dumbbell_Curl',
  },
  'ex-hammer-curl': {
    slug: 'Alternate_Hammer_Curl',
  },
  'ex-squat': {
    slug: 'Barbell_Full_Squat',
  },
  'ex-rdl': {
    slug: 'Romanian_Deadlift',
  },
  'ex-leg-press': {
    slug: 'Leg_Press',
  },
  'ex-hip-thrust': {
    slug: 'Barbell_Glute_Bridge',
  },
  'ex-bulgarian-split': {
    slug: 'Single_Leg_Squat',
  },
  'ex-pushups': {
    slug: 'Pushups',
  },
  'ex-plank': {
    slug: 'Plank',
  },
  'ex-burpees': {
    slug: 'Mountain_Climbers',
  },
};

/**
 * Devuelve las dos URLs de fotografias reales (posicion inicial y posicion final)
 * para cualquier ejercicio seleccionado por el usuario.
 */
export function getExerciseImageUrls(exerciseId: string, customSlug?: string): {
  frame0: string;
  frame1: string;
} {
  const slug =
    customSlug ||
    VERIFIED_API_MEDIA[exerciseId]?.slug ||
    'Barbell_Bench_Press_-_Medium_Grip';
  return {
    frame0: `${FREE_EX_CDN}/${slug}/0.jpg`,
    frame1: `${FREE_EX_CDN}/${slug}/1.jpg`,
  };
}

/**
 * Consulta la API REST publica de Wger Workout Manager para obtener enlaces
 * a archivos de video MP4 de ejercicios sin necesidad de clave de API.
 */
export async function fetchWgerPublicVideos(limit = 30): Promise<
  Array<{ id: number; exerciseId: number; videoUrl: string }>
> {
  try {
    const res = await fetch(
      `https://wger.de/api/v2/video/?limit=${limit}`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];
    return data.results
      .filter((item: any) => typeof item.video === 'string' && item.video.endsWith('.mp4'))
      .map((item: any) => ({
        id: item.id,
        exerciseId: item.exercise,
        videoUrl: item.video,
      }));
  } catch {
    return [];
  }
}

/**
 * Busca ejercicios por nombre o grupo muscular dentro del catalogo completo
 * de mas de 870 ejercicios de Free-Exercise-DB.
 */
export async function searchFreeExerciseDbCatalog(
  query: string,
  limit = 20
): Promise<ApiExerciseMedia[]> {
  try {
    const res = await fetch(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json'
    );
    if (!res.ok) return [];
    const list: any[] = await res.json();
    const q = query.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (item) =>
            item.name?.toLowerCase().includes(q) ||
            item.primaryMuscles?.some((m: string) => m.toLowerCase().includes(q))
        )
      : list;

    return filtered.slice(0, limit).map((item) => ({
      id: item.id,
      name: item.name,
      muscleGroup: item.primaryMuscles?.[0] || 'General',
      equipment: item.equipment || 'body only',
      imageStartUrl: `${FREE_EX_CDN}/${item.id}/0.jpg`,
      imageEndUrl: `${FREE_EX_CDN}/${item.id}/1.jpg`,
      instructions: item.instructions || [],
    }));
  } catch {
    return [];
  }
}
