// ============================================================================
// ARCHIVO: App.tsx
// DESCRIPCION: Componente principal de la aplicacion nativa en React Native.
// Coordina el inicio de sesion (Atleta o Coach), las secciones GYM y CASA,
// el modulo de comunidades con Spotify, el cronometro de entrenamiento en
// dos pasos y la calculadora cientifica de fuerza maxima (1RM Epley).
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import {
  WorkoutRoutine,
  WorkoutSessionLog,
  PersonalRecord,
  ExerciseItem,
} from './src/types/fitness';
import {
  DEFAULT_ROUTINES,
  INITIAL_LOGS,
  INITIAL_PRS,
} from './src/data/defaultWorkouts';
import {
  loadItem,
  saveItem,
  calculateEpley1RM,
  formatSeconds,
} from './src/utils/storage';
import { RestTimerBar } from './src/components/RestTimerModal';
import { PaywallModal } from './src/components/PaywallModal';
import { ExerciseDemoModal } from './src/components/ExerciseDemoModal';

type TabKey = 'home' | 'community' | 'workout' | 'demos' | 'progress';

interface CommunityRoutinePost {
  id: string;
  author: string;
  authorRole: string;
  pinned: boolean;
  title: string;
  instructions: string;
  spotifyPlaylist: string;
  likes: number;
  likedByMe: boolean;
}

interface CommunityWallPost {
  id: string;
  author: string;
  time: string;
  text: string;
  photoUrl?: string;
  likes: number;
  liked: boolean;
  pinned?: boolean;
}

export default function App() {
  // Login & User Role state
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Eder Fitness Pro');
  const [isOwnerMod, setIsOwnerMod] = useState<boolean>(true);
  const [initialDest, setInitialDest] = useState<'home' | 'community'>('home');

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(DEFAULT_ROUTINES);
  const [selectedEnv, setSelectedEnv] = useState<'GYM' | 'CASA'>('GYM');
  const [selectedRoutineId, setSelectedRoutineId] = useState<string>(
    DEFAULT_ROUTINES[0].id
  );
  const [logs, setLogs] = useState<WorkoutSessionLog[]>(INITIAL_LOGS);
  const [prs] = useState<PersonalRecord[]>(INITIAL_PRS);
  const [isPro, setIsPro] = useState<boolean>(false);
  const [paywallVisible, setPaywallVisible] = useState<boolean>(false);
  const [demoExercise, setDemoExercise] = useState<ExerciseItem | null>(null);
  const [bannerToast, setBannerToast] = useState<string | null>(null);

  // Community state
  const [commSubTab, setCommSubTab] = useState<'routines' | 'wall' | 'members'>(
    'routines'
  );
  const [commRoutines, setCommRoutines] = useState<CommunityRoutinePost[]>([
    {
      id: 'cr-1',
      author: 'Carlos "BeastMode" Vega',
      authorRole: 'Coach Pro',
      pinned: true,
      title: 'Destructor de Pecho & Tríceps (Método Bilbo + Pesado)',
      instructions:
        '1 serie explosiva de 15-20 reps en banca + 3 series pesadas de 6-8 reps con 2 min de descanso.',
      spotifyPlaylist: '🔥 PHONK BERSERK PR MODE (180 BPM)',
      likes: 84,
      likedByMe: false,
    },
    {
      id: 'cr-2',
      author: 'Valeria FitCoach',
      authorRole: 'Creadora Verificada',
      pinned: false,
      title: 'Glúteo de Acero: Hip Thrust Pausa 3s + Búlgaras',
      instructions:
        'Sostengan 3 segundos arriba en cada repetición de Hip Thrust sin arquear la espalda baja.',
      spotifyPlaylist: '🎧 Reggaetón & Trap Pesado Gym Session',
      likes: 112,
      likedByMe: true,
    },
  ]);

  const [commWall, setCommWall] = useState<CommunityWallPost[]>([
    {
      id: 'post-1',
      author: 'Marco Antonio Gymrat',
      time: 'Hace 12 min',
      text: '¡Raza! Por fin salieron los 100 kg en Press de Banca a 6 repeticiones limpias 🔥💪',
      photoUrl:
        'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Barbell_Bench_Press_-_Medium_Grip/1.jpg',
      likes: 29,
      liked: false,
      pinned: true,
    },
    {
      id: 'post-2',
      author: 'Usuario_Spam_99',
      time: 'Hace 1 hora',
      text: 'Post de prueba para que el Dueño de la comunidad pueda usar el botón de Eliminar o Expulsar 🛡️',
      likes: 1,
      liked: false,
    },
  ]);

  const [newRoutineTitle, setNewRoutineTitle] = useState<string>('');
  const [newRoutineInstr, setNewRoutineInstr] = useState<string>('');
  const [newSpotifyTitle, setNewSpotifyTitle] = useState<string>('');
  const [newWallText, setNewWallText] = useState<string>('');

  // Two-step Workout flow
  const [workoutStarted, setWorkoutStarted] = useState<boolean>(false);
  const [sessionRunning, setSessionRunning] = useState<boolean>(false);
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>(
    DEFAULT_ROUTINES[0].exercises.map((e) => e.id)
  );

  const [restRemaining, setRestRemaining] = useState<number>(0);
  const [restTotal, setRestTotal] = useState<number>(90);
  const [restExerciseName, setRestExerciseName] = useState<string>(
    'Press de Banca Plano'
  );

  const [calcWeight, setCalcWeight] = useState<string>('80');
  const [calcReps, setCalcReps] = useState<string>('8');

  useEffect(() => {
    (async () => {
      const savedLogs = await loadItem('fitpulse_logs_v5', INITIAL_LOGS);
      setLogs(savedLogs);
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (workoutStarted && sessionRunning) {
        setSessionSeconds((prev) => prev + 1);
      }
      setRestRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStarted, sessionRunning]);

  const showToast = (msg: string) => {
    setBannerToast(msg);
    setTimeout(() => {
      setBannerToast((current) => (current === msg ? null : current));
    }, 3200);
  };

  const activeRoutine =
    routines.find((r) => r.id === selectedRoutineId) || routines[0];

  const activeSelectedExercises = activeRoutine.exercises.filter((ex) =>
    selectedExerciseIds.includes(ex.id)
  );

  const filteredRoutines = routines.filter(
    (r) => r.environment === selectedEnv
  );

  const handlePrepareRoutine = (routineId: string) => {
    const target = routines.find((r) => r.id === routineId) || routines[0];
    setSelectedRoutineId(target.id);
    setSelectedEnv(target.environment);
    setSelectedExerciseIds(target.exercises.map((e) => e.id));
    setWorkoutStarted(false);
    setSessionRunning(false);
    setSessionSeconds(0);
    setRestRemaining(0);
    setActiveTab('workout');
  };

  const handlePublishCommRoutine = () => {
    if (!newRoutineTitle.trim()) {
      showToast('Escribe el título de tu rutina primero');
      return;
    }
    const created: CommunityRoutinePost = {
      id: `cr-${Date.now()}`,
      author: userName,
      authorRole: isOwnerMod ? 'Dueño 👑' : 'Atleta',
      pinned: true,
      title: newRoutineTitle.trim(),
      instructions:
        newRoutineInstr.trim() ||
        '4 series controladas cuidando la fase excéntrica.',
      spotifyPlaylist:
        newSpotifyTitle.trim() || '🔥 Mi Playlist Favorita de Spotify Gym',
      likes: 1,
      likedByMe: true,
    };
    setCommRoutines((prev) => [created, ...prev]);
    setNewRoutineTitle('');
    setNewRoutineInstr('');
    setNewSpotifyTitle('');
    showToast('🚀 ¡Rutina y Playlist de Spotify publicadas en la comunidad!');
  };

  const handlePublishWallPost = () => {
    if (!newWallText.trim()) return;
    const post: CommunityWallPost = {
      id: `post-${Date.now()}`,
      author: userName,
      time: 'Justo ahora',
      text: newWallText.trim(),
      likes: 1,
      liked: true,
    };
    setCommWall((prev) => [post, ...prev]);
    setNewWallText('');
    showToast('💬 ¡Comentario publicado en el muro de la comunidad!');
  };

  const estimatedOneRM = calculateEpley1RM(
    parseFloat(calcWeight) || 0,
    parseInt(calcReps, 10) || 0
  );

  // ==================== LOGIN SCREEN ====================
  if (!loggedIn) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#050811" />
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <Text style={styles.loginOverline}>
            BIENVENIDO A FITPULSE ELITE SOCIAL
          </Text>
          <Text style={styles.loginTitle}>
            Entrena con Rayos-X o Únete a una Comunidad Gymrat
          </Text>
          <Text style={styles.loginSubtitle}>
            Inicia sesión para subir tus propias rutinas, compartir tu Playlist de Spotify o entrenar con los videos de la app.
          </Text>

          <View style={styles.loginCard}>
            <Text style={styles.inputLabel}>1. ELIGE TU ROL EN LA APP</Text>
            <View style={styles.envDualRow}>
              <TouchableOpacity
                style={[
                  styles.envCardBtn,
                  isOwnerMod && styles.envCardBtnGymActive,
                ]}
                onPress={() => setIsOwnerMod(true)}
              >
                <Text style={styles.envIcon}>👑</Text>
                <Text style={styles.envTitle}>Dueño / Creador</Text>
                <Text style={styles.envSubtitle}>
                  Modera, sube rutinas y administra
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.envCardBtn,
                  !isOwnerMod && styles.envCardBtnCasaActive,
                ]}
                onPress={() => setIsOwnerMod(false)}
              >
                <Text style={styles.envIcon}>🏋️‍♂️</Text>
                <Text style={styles.envTitle}>Atleta / Miembro</Text>
                <Text style={styles.envSubtitle}>
                  Entrena, da likes y comparte fotos
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>2. TU NOMBRE DE USUARIO</Text>
            <TextInput
              style={[styles.textInputField, { marginBottom: 14 }]}
              value={userName}
              onChangeText={setUserName}
              placeholder="Ej. Eder Fitness Pro"
              placeholderTextColor="#64748B"
            />

            <Text style={styles.inputLabel}>
              3. ¿QUÉ QUIERES HACER AL ENTRAR?
            </Text>
            <View style={styles.envDualRow}>
              <TouchableOpacity
                style={[
                  styles.envCardBtn,
                  initialDest === 'home' && styles.envCardBtnGymActive,
                ]}
                onPress={() => setInitialDest('home')}
              >
                <Text style={styles.envTitle}>⚡ Videos de la App</Text>
                <Text style={styles.envSubtitle}>Rutinas GYM y En Casa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.envCardBtn,
                  initialDest === 'community' && styles.envCardBtnCasaActive,
                ]}
                onPress={() => setInitialDest('community')}
              >
                <Text style={styles.envTitle}>🔥 Ir a Comunidad</Text>
                <Text style={styles.envSubtitle}>
                  Rutinas, Spotify & Muro Social
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.bigStartClockBtn}
              onPress={() => {
                setLoggedIn(true);
                setActiveTab(initialDest);
              }}
            >
              <Text style={styles.bigStartClockBtnText}>
                🚀 Entrar a FitPulse Elite Ahora
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#050811" />

      {/* Top App Bar */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <View style={styles.logoDot} />
            <Text style={styles.brandTitle}>FITPULSE ELITE</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {isOwnerMod ? '👑 Dueño/Mod: ' : '🏋️‍♂️ Atleta: '}
            {userName}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.proHeaderBtn}
          onPress={() => setLoggedIn(false)}
        >
          <Text style={styles.proHeaderBtnText}>👤 Cambiar Cuenta</Text>
        </TouchableOpacity>
      </View>

      {bannerToast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{bannerToast}</Text>
        </View>
      )}

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== TAB 1: INICIO (CAMINO SOLO vs COMUNIDAD) ==================== */}
        {activeTab === 'home' && (
          <View>
            {/* Selector Principal: ¿Entrenar con la App o Unirse a una Comunidad? */}
            <View style={styles.envDualRow}>
              <TouchableOpacity
                style={[styles.envCardBtn, styles.envCardBtnGymActive]}
                onPress={() => setActiveTab('home')}
              >
                <Text style={styles.envIcon}>⚡</Text>
                <Text style={styles.envTitle}>Entrenar con la App</Text>
                <Text style={styles.envSubtitle}>
                  Videos Rayos-X (GYM y En Casa)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.envCardBtn, styles.envCardBtnCasaActive]}
                onPress={() => setActiveTab('community')}
              >
                <Text style={styles.envIcon}>🔥</Text>
                <Text style={styles.envTitle}>Unirse a Comunidad</Text>
                <Text style={styles.envSubtitle}>
                  Rutinas de Usuarios, Chat & Spotify
                </Text>
              </TouchableOpacity>
            </View>

            {/* Switcher GYM vs EN CASA */}
            <View style={styles.envDualRow}>
              <TouchableOpacity
                style={[
                  styles.envCardBtn,
                  selectedEnv === 'GYM' && styles.envCardBtnGymActive,
                ]}
                onPress={() => setSelectedEnv('GYM')}
              >
                <Text style={styles.envTitle}>🏋️‍♂️ SECCIÓN GYM</Text>
                <Text style={styles.envSubtitle}>Barras, Poleas & Prensa</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.envCardBtn,
                  selectedEnv === 'CASA' && styles.envCardBtnCasaActive,
                ]}
                onPress={() => setSelectedEnv('CASA')}
              >
                <Text style={styles.envTitle}>🏠 SECCIÓN EN CASA</Text>
                <Text style={styles.envSubtitle}>Sin Equipo & Calistenia</Text>
              </TouchableOpacity>
            </View>

            {filteredRoutines.map((routine) => (
              <View key={routine.id} style={styles.routineCard}>
                <View
                  style={[
                    styles.routineAccentStrip,
                    { backgroundColor: routine.accentColor },
                  ]}
                />
                <View style={styles.routineCardBody}>
                  <Text style={styles.routineTitle}>{routine.title}</Text>
                  <Text style={styles.routineSubtitle}>{routine.subtitle}</Text>
                  <View style={styles.routineFooterRow}>
                    <TouchableOpacity
                      style={styles.demoPreviewPill}
                      onPress={() =>
                        setDemoExercise(routine.exercises[0] || null)
                      }
                    >
                      <Text style={styles.demoPreviewPillText}>
                        🧬 Ver Rayos-X
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.startRoutineBtn,
                        { backgroundColor: routine.accentColor },
                      ]}
                      onPress={() => handlePrepareRoutine(routine.id)}
                    >
                      <Text style={styles.startRoutineBtnText}>
                        Elegir Ejercicios →
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ==================== TAB COMUNIDAD: RUTINAS + SPOTIFY + MURO + MODERACIÓN ==================== */}
        {activeTab === 'community' && (
          <View>
            <View style={styles.sectionCard}>
              <View style={styles.routineFooterRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prepStepBadge}>
                    🔥 COMUNIDAD VERIFICADA • 1,420 MIEMBROS
                  </Text>
                  <Text style={styles.prepTitle}>
                    Club Aesthetics & Powerbuilding MX
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.proHeaderBtn}
                  onPress={() => setIsOwnerMod(!isOwnerMod)}
                >
                  <Text style={styles.proHeaderBtnText}>
                    {isOwnerMod ? '👑 Dueño ON' : '👤 Miembro'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.envDualRow, { marginTop: 10, marginBottom: 0 }]}>
                <TouchableOpacity
                  style={[
                    styles.catChip,
                    commSubTab === 'routines' && styles.catChipSelected,
                  ]}
                  onPress={() => setCommSubTab('routines')}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      commSubTab === 'routines' && styles.catChipTextSelected,
                    ]}
                  >
                    📋 Rutinas + Spotify
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.catChip,
                    commSubTab === 'wall' && styles.catChipSelected,
                  ]}
                  onPress={() => setCommSubTab('wall')}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      commSubTab === 'wall' && styles.catChipTextSelected,
                    ]}
                  >
                    💬 Muro / Fotos & Chat
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {commSubTab === 'routines' && (
              <View>
                {/* Subir nueva rutina con Spotify */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    + Subir Mi Rutina + Video + Playlist de Spotify 🎵
                  </Text>
                  <TextInput
                    style={[styles.textInputField, { marginBottom: 8 }]}
                    placeholder="Título de tu rutina..."
                    placeholderTextColor="#64748B"
                    value={newRoutineTitle}
                    onChangeText={setNewRoutineTitle}
                  />
                  <TextInput
                    style={[styles.textInputField, { marginBottom: 8 }]}
                    placeholder="Instrucciones y consejos..."
                    placeholderTextColor="#64748B"
                    value={newRoutineInstr}
                    onChangeText={setNewRoutineInstr}
                  />
                  <TextInput
                    style={[styles.textInputField, { marginBottom: 8 }]}
                    placeholder="🎵 Nombre o link de tu Playlist de Spotify..."
                    placeholderTextColor="#64748B"
                    value={newSpotifyTitle}
                    onChangeText={setNewSpotifyTitle}
                  />
                  <TouchableOpacity
                    style={styles.bigStartClockBtn}
                    onPress={handlePublishCommRoutine}
                  >
                    <Text style={styles.bigStartClockBtnText}>
                      🚀 Publicar en la Comunidad
                    </Text>
                  </TouchableOpacity>
                </View>

                {commRoutines.map((cr) => (
                  <View key={cr.id} style={styles.sectionCard}>
                    <Text style={styles.prepStepBadge}>
                      👤 {cr.author} ({cr.authorRole}){' '}
                      {cr.pinned ? '• 📌 FIJADA' : ''}
                    </Text>
                    <Text style={styles.routineTitle}>{cr.title}</Text>
                    <Text style={styles.routineSubtitle}>{cr.instructions}</Text>

                    <View style={styles.spotifyBox}>
                      <Text style={styles.spotifyTitle}>
                        🎵 Spotify: {cr.spotifyPlaylist}
                      </Text>
                    </View>

                    <View style={styles.routineFooterRow}>
                      <TouchableOpacity
                        style={styles.demoPreviewPill}
                        onPress={() =>
                          setCommRoutines((prev) =>
                            prev.map((item) =>
                              item.id === cr.id
                                ? {
                                    ...item,
                                    likedByMe: !item.likedByMe,
                                    likes: item.likes + (item.likedByMe ? -1 : 1),
                                  }
                                : item
                            )
                          )
                        }
                      >
                        <Text style={styles.demoPreviewPillText}>
                          ❤️ {cr.likes} Likes
                        </Text>
                      </TouchableOpacity>

                      {isOwnerMod && (
                        <TouchableOpacity
                          style={styles.deleteModBtn}
                          onPress={() =>
                            setCommRoutines((prev) =>
                              prev.filter((i) => i.id !== cr.id)
                            )
                          }
                        >
                          <Text style={styles.deleteModBtnText}>
                            🗑️ Eliminar (Dueño)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {commSubTab === 'wall' && (
              <View>
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    📸 Comparte tu experiencia o foto en el muro
                  </Text>
                  <TextInput
                    style={[styles.textInputField, { marginBottom: 8 }]}
                    placeholder="Escribe tu experiencia o PR de hoy..."
                    placeholderTextColor="#64748B"
                    value={newWallText}
                    onChangeText={setNewWallText}
                  />
                  <TouchableOpacity
                    style={styles.bigStartClockBtn}
                    onPress={handlePublishWallPost}
                  >
                    <Text style={styles.bigStartClockBtnText}>
                      Publicar en el Muro →
                    </Text>
                  </TouchableOpacity>
                </View>

                {commWall.map((post) => (
                  <View key={post.id} style={styles.sectionCard}>
                    <Text style={styles.prepExName}>
                      💬 {post.author} • {post.time}
                    </Text>
                    <Text
                      style={[
                        styles.routineSubtitle,
                        { marginTop: 4, color: '#E2E8F0' },
                      ]}
                    >
                      {post.text}
                    </Text>
                    {post.photoUrl && (
                      <Image
                        source={{ uri: post.photoUrl }}
                        style={{
                          width: '100%',
                          height: 150,
                          borderRadius: 12,
                          marginBottom: 10,
                        }}
                      />
                    )}
                    <View style={styles.routineFooterRow}>
                      <TouchableOpacity
                        style={styles.demoPreviewPill}
                        onPress={() =>
                          setCommWall((prev) =>
                            prev.map((p) =>
                              p.id === post.id
                                ? { ...p, likes: p.likes + 1 }
                                : p
                            )
                          )
                        }
                      >
                        <Text style={styles.demoPreviewPillText}>
                          ❤️ {post.likes} Likes
                        </Text>
                      </TouchableOpacity>

                      {isOwnerMod && (
                        <TouchableOpacity
                          style={styles.deleteModBtn}
                          onPress={() => {
                            setCommWall((prev) =>
                              prev.filter((p) => p.id !== post.id)
                            );
                            showToast(
                              `🚫 Post y usuario ${post.author} moderados`
                            );
                          }}
                        >
                          <Text style={styles.deleteModBtnText}>
                            🚫 Borrar / Expulsar Usuario
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ==================== TAB 2: ENTRENAMIENTO (2 PASOS) ==================== */}
        {activeTab === 'workout' && (
          <View>
            {!workoutStarted ? (
              <View style={styles.prepCard}>
                <Text style={styles.prepStepBadge}>
                  PASO 1 DE 2 • CRONÓMETRO EN ESPERA (00:00)
                </Text>
                <Text style={styles.prepTitle}>
                  Selecciona tus ejercicios y revisa su Rayos-X antes de iniciar
                </Text>
                {activeRoutine.exercises.map((ex, idx) => {
                  const isChecked = selectedExerciseIds.includes(ex.id);
                  return (
                    <View
                      key={ex.id}
                      style={[
                        styles.prepExerciseItem,
                        isChecked && styles.prepExerciseItemChecked,
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.checkboxSquare,
                          isChecked && styles.checkboxSquareChecked,
                        ]}
                        onPress={() =>
                          setSelectedExerciseIds((prev) =>
                            prev.includes(ex.id)
                              ? prev.filter((id) => id !== ex.id)
                              : [...prev, ex.id]
                          )
                        }
                      >
                        <Text style={styles.checkboxMark}>
                          {isChecked ? '✓' : ''}
                        </Text>
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.prepExName}>
                          {idx + 1}. {ex.name}
                        </Text>
                        <Text style={styles.prepExMeta}>
                          🎯 {ex.muscleGroup}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.watchVideoBtn}
                        onPress={() => setDemoExercise(ex)}
                      >
                        <Text style={styles.watchVideoBtnText}>
                          🧬 Rayos-X
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={styles.bigStartClockBtn}
                  onPress={() => {
                    setWorkoutStarted(true);
                    setSessionRunning(true);
                  }}
                >
                  <Text style={styles.bigStartClockBtnText}>
                    ▶ ESTOY LISTO • INICIAR CRONÓMETRO
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.liveSessionCard}>
                <Text style={styles.liveRoutineBadge}>
                  ● CRONÓMETRO EN MARCHA: {formatSeconds(sessionSeconds)}
                </Text>
                <Text style={styles.liveRoutineTitle}>
                  {activeRoutine.title}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ==================== TAB 4: PROGRESO & 1RM ==================== */}
        {activeTab === 'progress' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
              🧮 Calculadora Científica de 1RM: {estimatedOneRM} kg
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomTabBar}>
        {[
          { key: 'home', icon: '⚡', label: 'Inicio' },
          { key: 'community', icon: '🔥', label: 'Comunidad' },
          { key: 'workout', icon: '🏋️', label: 'Entrenar' },
          { key: 'demos', icon: '🧬', label: 'Rayos-X' },
          { key: 'progress', icon: '📈', label: '1RM' },
        ].map((tab) => {
          const isFocused = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key as TabKey)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text
                style={[styles.tabLabel, isFocused && styles.tabLabelActive]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ExerciseDemoModal
        visible={!!demoExercise}
        exercise={demoExercise}
        onClose={() => setDemoExercise(null)}
      />

      <PaywallModal
        visible={paywallVisible}
        isPro={isPro}
        onClose={() => setPaywallVisible(false)}
        onUnlockPro={() => setIsPro(true)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050811',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  loginContainer: {
    padding: 22,
  },
  loginOverline: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  loginTitle: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 6,
  },
  loginSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
    lineHeight: 19,
  },
  loginCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  brandTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
  },
  headerSubtitle: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  proHeaderBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
  },
  proHeaderBtnText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  toastBanner: {
    backgroundColor: '#065F46',
    paddingVertical: 9,
    paddingHorizontal: 16,
  },
  toastText: {
    color: '#ECFDF5',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  contentScroll: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 36 },
  envDualRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  envCardBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 12,
  },
  envCardBtnGymActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
  },
  envCardBtnCasaActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  envIcon: { fontSize: 18, marginBottom: 3 },
  envTitle: { color: '#F8FAFC', fontSize: 13, fontWeight: '900' },
  envSubtitle: { color: '#94A3B8', fontSize: 10, marginTop: 2 },
  catChip: {
    backgroundColor: '#050811',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  catChipSelected: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  catChipText: { color: '#94A3B8', fontSize: 11, fontWeight: '800' },
  catChipTextSelected: { color: '#022C22' },
  prepCard: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  prepStepBadge: { color: '#F59E0B', fontSize: 10, fontWeight: '900' },
  prepTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '900',
    marginVertical: 4,
  },
  prepExerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#050811',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  prepExerciseItemChecked: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  checkboxSquare: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkboxMark: { color: '#022C22', fontSize: 14, fontWeight: '900' },
  prepExName: { color: '#F8FAFC', fontSize: 13, fontWeight: '800' },
  prepExMeta: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  bigStartClockBtn: {
    marginTop: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  bigStartClockBtnText: { color: '#022C22', fontSize: 13, fontWeight: '900' },
  sectionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  routineCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  routineAccentStrip: { width: 6 },
  routineCardBody: { flex: 1, padding: 15 },
  routineTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 3,
  },
  routineSubtitle: { color: '#94A3B8', fontSize: 12, marginBottom: 10 },
  routineFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  demoPreviewPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  demoPreviewPillText: { color: '#38BDF8', fontSize: 11, fontWeight: '800' },
  startRoutineBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  startRoutineBtnText: { color: '#022C22', fontSize: 12, fontWeight: '900' },
  spotifyBox: {
    backgroundColor: 'rgba(29, 185, 84, 0.16)',
    borderColor: '#1DB954',
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  spotifyTitle: { color: '#1DB954', fontSize: 12, fontWeight: '800' },
  deleteModBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.16)',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteModBtnText: { color: '#FCA5A5', fontSize: 11, fontWeight: '800' },
  liveSessionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
  liveRoutineBadge: { color: '#10B981', fontSize: 12, fontWeight: '800' },
  liveRoutineTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '900',
    marginTop: 4,
  },
  watchVideoBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  watchVideoBtnText: { color: '#38BDF8', fontSize: 11, fontWeight: '800' },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },
  textInputField: {
    backgroundColor: '#050811',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 16 },
  tabLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', marginTop: 2 },
  tabLabelActive: { color: '#10B981' },
});
