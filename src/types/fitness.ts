// ============================================================================
// ARCHIVO: src/types/fitness.ts
// DESCRIPCION: Definicion de tipos e interfaces de TypeScript para toda la app.
// Asegura que las rutinas, ejercicios, series, records y animaciones de Rayos-X
// tengan una estructura estricta y sin errores de compilacion.
// ============================================================================

// Lista de las 19 animaciones biomecanicas de Rayos-X disponibles en el motor grafico.
export type AnimationPoseType =
  | 'bench_press'     // Press de banca plano con barra
  | 'incline_press'   // Press inclinado con mancuernas
  | 'shoulder_press'  // Press militar de hombros sentado
  | 'lateral_raise'   // Elevaciones laterales para deltoides
  | 'tricep_pushdown' // Extension de triceps en polea alta
  | 'lat_pulldown'    // Jalon al pecho en polea para espalda
  | 'barbell_row'     // Remo inclinado con barra
  | 'bicep_curl'      // Curl de biceps con mancuernas o barra
  | 'squat'           // Sentadilla libre profunda con barra
  | 'rdl'             // Peso muerto rumano para isquiotibiales y gluteo
  | 'leg_press'       // Prensa inclinada de piernas a 45 grados
  | 'hip_thrust'      // Empuje de cadera (Hip Thrust) para gluteo
  | 'pushup'          // Lagartijas o flexiones de pecho en piso (Casa)
  | 'chair_dips'      // Fondos de triceps apoyado en una silla (Casa)
  | 'bulgarian_squat' // Sentadilla bulgara unilateral con pie en silla (Casa)
  | 'leg_raise'       // Elevacion de piernas acostado para abdomen (Casa)
  | 'jump_squat'      // Sentadilla explosiva con salto pliometrico (Casa)
  | 'plank'           // Plancha abdominal isometrica (Casa)
  | 'climbers';       // Escaladores de montana o Mountain Climbers (Casa)

// Representa una serie individual dentro de un ejercicio (ej. Serie 1: 80 kg x 10 reps).
export interface ExerciseSet {
  id: string;         // Identificador unico de la serie
  weight: string;     // Peso utilizado en kilogramos
  reps: string;       // Numero de repeticiones realizadas
  rpe?: string;       // Esfuerzo percibido opcional del 1 al 10 (RPE)
  completed: boolean; // Indica si el usuario ya marco la serie como terminada
  isPR?: boolean;     // Indica si esta serie rompio un record personal de fuerza
}

// Representa un ejercicio completo con su guia biomecanica y sus series asignadas.
export interface ExerciseItem {
  id: string;                  // Identificador unico del ejercicio
  name: string;                // Nombre del ejercicio en espanol
  muscleGroup: string;         // Musculo principal que se ilumina en el Rayos-X
  secondaryMuscles: string[];  // Musculos secundarios sinergistas
  equipment: string;           // Equipo necesario (Barra, Mancuernas, Polea, Sin Equipo)
  restSeconds: number;         // Segundos de descanso recomendados al terminar cada serie
  targetReps: string;          // Rango de repeticiones objetivo (ej. "8-10 reps")
  tempo: string;               // Velocidad de ejecucion recomendada (ej. "3-1-1")
  poseType: AnimationPoseType; // Clave de la animacion biomecanica que debe dibujarse
  videoPreviewTitle: string;   // Subtitulo descriptivo para el modal de video
  cues: string[];              // Consejos paso a paso para cuidar la postura y evitar lesiones
  commonMistake: string;       // Error tipico que el atleta debe evitar en este ejercicio
  notes?: string;              // Notas personales escritas por el usuario
  sets: ExerciseSet[];         // Arreglo de series que componen el ejercicio
}

// Representa una rutina completa de entrenamiento (para Gimnasio o para Casa).
export interface WorkoutRoutine {
  id: string;
  environment: 'GYM' | 'CASA'; // Clasifica si la rutina pertenece a la seccion GYM o CASA
  title: string;               // Titulo principal de la rutina
  subtitle: string;            // Resumen de los grupos musculares trabajados
  category:
    | 'Hipertrofia'
    | 'Fuerza'
    | 'Glúteo & Pierna'
    | 'Casa / Calistenia'
    | 'HIIT & Core';
  durationMin: number;         // Duracion estimada en minutos
  caloriesBurn: number;        // Calorias aproximadas quemadas por sesion
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  accentColor: string;         // Color principal de la tarjeta en formato hexadecimal
  gradientColors: [string, string]; // Par de colores para el degradado visual
  exercises: ExerciseItem[];   // Lista de ejercicios incluidos en la rutina
}

// Registro historico que se guarda cada vez que el usuario finaliza un entrenamiento.
export interface WorkoutSessionLog {
  id: string;
  routineTitle: string;    // Nombre de la rutina que se entreno
  dateISO: string;         // Fecha exacta en formato estandar ISO
  dateLabel: string;       // Fecha legible para mostrar en pantalla
  durationSeconds: number; // Tiempo total que estuvo corriendo el cronometro
  totalVolumeKg: number;   // Total de kilogramos levantados en toda la sesion
  completedSets: number;   // Total de series completadas
  prsAchieved: number;     // Cantidad de records personales batidos en esa sesion
}

// Registro del mejor levantamiento historico del usuario por cada ejercicio.
export interface PersonalRecord {
  exerciseName: string; // Nombre del ejercicio
  muscleGroup: string;  // Grupo muscular al que pertenece
  bestWeightKg: number; // Mayor peso levantado en kilogramos
  repsAtBest: number;   // Repeticiones logradas con ese peso
  estimated1RM: number; // Fuerza maxima estimada a 1 repeticion (Formula Epley)
  dateLabel: string;    // Fecha en que se logro el record
}

// Registro para el control de peso corporal del usuario a lo largo del tiempo.
export interface BodyWeightEntry {
  id: string;
  dateLabel: string; // Fecha de la medicion
  weightKg: number;  // Peso corporal del atleta en kilogramos
}
