-- =====================================================================
-- ESQUEMA DE BASE DE DATOS OFICIAL: FITPULSE PRO (SUPABASE / POSTGRESQL)
-- Costo: $0 USD (Plan Gratuito de Supabase incluye Autenticacion, Base de Datos y Storage)
-- Instrucciones: Copia y pega este script en el editor SQL de tu cuenta de Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABLA DE PERFILES DE USUARIO (ATLETAS Y COACHES)
-- Guarda la informacion basica del usuario que inicia sesion, su rol
-- (atleta o entrenador), su foto de perfil y sus redes sociales.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico del usuario
  username TEXT NOT NULL UNIQUE,                          -- Nombre de usuario unico en la plataforma
  full_name TEXT NOT NULL,                                -- Nombre visible del atleta o entrenador
  role TEXT NOT NULL CHECK (role IN ('athlete', 'coach')),-- Define si entra como Atleta o como Coach
  avatar_url TEXT,                                        -- URL de su fotografia de perfil
  instagram_handle TEXT,                                  -- Usuario de Instagram del entrenador o atleta
  tiktok_handle TEXT,                                     -- Usuario de TikTok del entrenador o atleta
  youtube_channel TEXT,                                   -- Nombre o enlace del canal de YouTube
  spotify_user_id TEXT,                                   -- Identificador de cuenta de Spotify conectada
  streak_days INTEGER DEFAULT 1,                          -- Dias consecutivos entrenando en la aplicacion
  created_at TIMESTAMPTZ DEFAULT NOW()                    -- Fecha y hora de creacion del registro
);

-- ---------------------------------------------------------------------
-- 2. TABLA DE COMUNIDADES CREADAS POR ENTRENADORES
-- Guarda cada club o comunidad creada por un Coach, su configuracion de
-- privacidad (publica o por solicitud), redes sociales y playlist oficial.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico de la comunidad
  owner_coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Referencia al Coach dueno
  name TEXT NOT NULL,                                     -- Nombre oficial de la comunidad o club
  description TEXT NOT NULL,                              -- Descripcion y metas del grupo de entrenamiento
  cover_image_url TEXT,                                   -- Fotografia de portada subida desde el celular
  avatar_image_url TEXT,                                  -- Fotografia del entrenador titular
  privacy_mode TEXT NOT NULL CHECK (privacy_mode IN ('public', 'invite')), -- Acceso libre (public) o privado por solicitud (invite)
  instagram_handle TEXT,                                  -- Cuenta oficial de Instagram mostrada en la comunidad
  tiktok_handle TEXT,                                     -- Cuenta oficial de TikTok mostrada en la comunidad
  youtube_channel TEXT,                                   -- Canal oficial de YouTube mostrado en la comunidad
  spotify_playlist_id TEXT,                               -- ID de la playlist de Spotify conectada por el Coach
  spotify_playlist_name TEXT,                             -- Nombre visible de la playlist de Spotify
  members_count INTEGER DEFAULT 1,                        -- Total de miembros activos dentro de la comunidad
  created_at TIMESTAMPTZ DEFAULT NOW()                    -- Fecha de fundacion de la comunidad
);

-- ---------------------------------------------------------------------
-- 3. TABLA DE GALERIA DE FOTOS DEL ENTRENADOR EN SU COMUNIDAD
-- Permite al Coach subir fotografias de su fisico, gimnasio o resultados
-- desde su telefono para mostrarlas en la pestana de perfil del Coach.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coach_gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico de la fotografia
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE, -- Comunidad a la que pertenece la foto
  photo_url TEXT NOT NULL,                                -- URL de la imagen almacenada en Supabase Storage
  caption TEXT,                                           -- Pie de foto o descripcion opcional
  created_at TIMESTAMPTZ DEFAULT NOW()                    -- Fecha en la que se subio la fotografia
);

-- ---------------------------------------------------------------------
-- 4. TABLA DE MIEMBROS Y SOLICITUDES DE INGRESO
-- Controla que usuarios pertenecen a cada comunidad y gestiona el estado
-- de las solicitudes cuando una comunidad es privada por invitacion.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico de la membresia o solicitud
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE, -- Comunidad objetivo
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,         -- Usuario atleta que solicita o pertenece
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'banned')), -- Estado: pendiente, aceptado, rechazado o expulsado
  request_message TEXT,                                   -- Mensaje enviado por el atleta al pedir acceso al Coach
  is_vip BOOLEAN DEFAULT FALSE,                           -- Indica si el miembro fue destacado por el Coach
  created_at TIMESTAMPTZ DEFAULT NOW(),                   -- Fecha de envio de la solicitud
  UNIQUE(community_id, user_id)                           -- Evita que un usuario envie solicitudes duplicadas al mismo club
);

-- ---------------------------------------------------------------------
-- 5. TABLA DE RUTINAS Y VIDEOS SUBIDOS A LA COMUNIDAD
-- Almacena las rutinas publicadas por el Coach junto con su video grabado
-- desde el celular, la pose de Rayos-X y la playlist de Spotify asociada.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico de la rutina comunitaria
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE, -- Comunidad donde se publico
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,       -- Coach o autor que subio la rutina
  title TEXT NOT NULL,                                    -- Titulo de la rutina o ejercicio
  instructions TEXT NOT NULL,                             -- Indicaciones de series, repeticiones, tempo y descanso
  custom_video_url TEXT,                                  -- Enlace al archivo de video subido desde la galeria del celular
  xray_pose_key TEXT DEFAULT 'bench_press',               -- Identificador de la animacion biomecanica de Rayos-X a 60fps
  api_exercise_slug TEXT DEFAULT 'Barbell_Bench_Press_-_Medium_Grip', -- Identificador para cargar fotografias reales de gimnasio
  spotify_playlist_id TEXT,                               -- ID de la playlist de Spotify incrustada en esta rutina
  likes_count INTEGER DEFAULT 0,                          -- Cantidad de "Me gusta" recibidos de los miembros
  is_pinned BOOLEAN DEFAULT FALSE,                        -- Indica si el Coach fijo esta rutina en la parte superior
  created_at TIMESTAMPTZ DEFAULT NOW()                    -- Fecha de publicacion de la rutina
);

-- ---------------------------------------------------------------------
-- 6. TABLA DEL MURO SOCIAL / CHAT Y FOTOS DE PROGRESO
-- Permite a los atletas y al Coach compartir comentarios, dudas y fotos
-- de su entrenamiento diario dentro de la comunidad.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_wall_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico de la publicacion en el muro
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE, -- Comunidad a la que pertenece el mensaje
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,       -- Usuario autor del mensaje
  author_name TEXT NOT NULL,                              -- Nombre visible del autor para lectura rapida
  content_text TEXT NOT NULL,                             -- Texto de la experiencia o comentario publicado
  photo_url TEXT,                                         -- Fotografia opcional subida desde el celular al muro
  likes_count INTEGER DEFAULT 0,                          -- Contador de reacciones o likes en el mensaje
  is_pinned BOOLEAN DEFAULT FALSE,                        -- Indica si el mensaje fue fijado por el moderador
  created_at TIMESTAMPTZ DEFAULT NOW()                    -- Fecha y hora de publicacion en el muro
);

-- ---------------------------------------------------------------------
-- 7. TABLA DE HISTORIAL DE ENTRENAMIENTOS Y RECORDS 1RM DEL ATLETA
-- Registra cada sesion finalizada con el cronometro de la aplicacion,
-- guardando el tiempo total, volumen en kilogramos y fuerza maxima (1RM).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),          -- Identificador unico de la sesion de entrenamiento
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Atleta que realizo el entrenamiento
  routine_title TEXT NOT NULL,                            -- Nombre de la rutina realizada
  environment TEXT CHECK (environment IN ('GYM', 'CASA')),-- Modalidad seleccionada: Gimnasio o Casa
  duration_seconds INTEGER NOT NULL,                      -- Tiempo total cronometrado en segundos
  total_volume_kg NUMERIC(10, 2) DEFAULT 0,               -- Peso total movido (suma de peso por repeticiones)
  completed_sets INTEGER DEFAULT 0,                       -- Numero total de series completadas en la sesion
  estimated_1rm_best NUMERIC(6, 2) DEFAULT 0,             -- Mejor record de 1 repeticion maxima calculado con formula Epley
  created_at TIMESTAMPTZ DEFAULT NOW()                    -- Fecha en que se completo el entrenamiento
);

-- =====================================================================
-- POLITICAS DE SEGURIDAD (ROW LEVEL SECURITY - MODERACION DEL DUENO)
-- Garantizan a nivel de base de datos que solo el Coach fundador pueda
-- eliminar publicaciones inapropiadas o aceptar solicitudes en su club.
-- =====================================================================
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_memberships ENABLE ROW LEVEL SECURITY;

-- Politica SQL: Verifica que el usuario autenticado sea el dueno de la comunidad antes de borrar un post
CREATE POLICY "Coach dueno puede moderar y borrar posts de su comunidad"
  ON public.community_wall_posts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.communities c
      WHERE c.id = community_wall_posts.community_id
      AND c.owner_coach_id = auth.uid()
    )
  );
