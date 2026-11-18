// ============================================================================
// ARCHIVO: src/components/ExerciseDemoModal.tsx
// DESCRIPCION: Modal interactivo que muestra la demostracion tecnica de cada
// ejercicio conectandose al servidor de fotografias reales Free-Exercise-DB
// y mostrando las instrucciones biomecanicas y errores comunes a evitar.
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Image,
} from 'react-native';
import { ExerciseItem } from '../types/fitness';
import { getExerciseImageUrls } from '../utils/exerciseApi';

interface ExerciseDemoModalProps {
  visible: boolean;
  exercise: ExerciseItem | null;
  onClose: () => void;
}

export const ExerciseDemoModal: React.FC<ExerciseDemoModalProps> = ({
  visible,
  exercise,
  onClose,
}) => {
  const [frameIndex, setFrameIndex] = useState<0 | 1>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setImgError(false);
    setFrameIndex(0);
  }, [exercise]);

  useEffect(() => {
    if (!visible || !isPlaying) return;
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev === 0 ? 1 : 0));
    }, 1100);
    return () => clearInterval(timer);
  }, [visible, isPlaying]);

  if (!exercise) return null;

  const { frame0, frame1 } = getExerciseImageUrls(exercise.id);
  const currentImgUri = frameIndex === 0 ? frame0 : frame1;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Top Bar */}
            <View style={styles.topRow}>
              <View style={styles.liveTag}>
                <View style={styles.liveDot} />
                <Text style={styles.liveTagText}>
                  API CONECTADA • DEMO REAL DE GIMNASIO
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{exercise.name}</Text>
            <Text style={styles.subtitle}>
              🎯 {exercise.muscleGroup} • Tempo {exercise.tempo} • Descanso{' '}
              {exercise.restSeconds}s
            </Text>

            {/* Real Exercise API Media Player */}
            <View style={styles.videoViewport}>
              <View style={styles.viewportHeader}>
                <Text style={styles.tempoBadge}>
                  {frameIndex === 0
                    ? '1/2 POSICIÓN INICIAL (INHALA)'
                    : '2/2 CONTRACCIÓN MÁXIMA (EXHALA)'}
                </Text>
                <Text style={styles.repCounterText}>FREE-EXERCISE-DB API</Text>
              </View>

              <View style={styles.imageContainer}>
                {!imgError ? (
                  <Image
                    source={{ uri: currentImgUri }}
                    style={styles.realExerciseImage}
                    resizeMode="cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <View style={styles.fallbackBox}>
                    <Text style={styles.fallbackTitle}>
                      {frameIndex === 0
                        ? '↓ Fase Excéntrica Controlada'
                        : '↑ Fase Concéntrica Explosiva'}
                    </Text>
                    <Text style={styles.fallbackSub}>
                      Conéctate a internet para cargar las fotos reales de la API
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.playerControls}>
                <TouchableOpacity
                  style={styles.playPauseBtn}
                  onPress={() => setIsPlaying(!isPlaying)}
                >
                  <Text style={styles.playPauseText}>
                    {isPlaying ? '⏸ Pausar Secuencia' : '▶ Reanudar Secuencia'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.nextPhaseBtn}
                  onPress={() => setFrameIndex(frameIndex === 0 ? 1 : 0)}
                >
                  <Text style={styles.nextPhaseText}>
                    Alternar Posición 1/2 →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Step-by-Step Cues */}
            <View style={styles.cuesCard}>
              <Text style={styles.sectionTitle}>
                ✅ Técnica Perfecta Paso a Paso
              </Text>
              {exercise.cues?.map((cue, idx) => (
                <View key={idx} style={styles.cueRow}>
                  <View style={styles.cueNum}>
                    <Text style={styles.cueNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.cueText}>{cue}</Text>
                </View>
              ))}
            </View>

            {/* Common Mistake Alert */}
            <View style={styles.mistakeCard}>
              <Text style={styles.mistakeTitle}>
                ⚠️ Error Común a Evitar
              </Text>
              <Text style={styles.mistakeDesc}>{exercise.commonMistake}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.88)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: '#1E293B',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveTagText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 14,
  },
  videoViewport: {
    backgroundColor: '#060B14',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
  },
  viewportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tempoBadge: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  repCounterText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  imageContainer: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  realExerciseImage: {
    width: '100%',
    height: '100%',
  },
  fallbackBox: {
    padding: 20,
    alignItems: 'center',
  },
  fallbackTitle: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '900',
  },
  fallbackSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  playerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  playPauseBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  playPauseText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  nextPhaseBtn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextPhaseText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '800',
  },
  cuesCard: {
    backgroundColor: '#060B14',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 8,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cueNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cueNumText: {
    color: '#022C22',
    fontSize: 11,
    fontWeight: '900',
  },
  cueText: {
    color: '#E2E8F0',
    fontSize: 12,
    flex: 1,
    lineHeight: 17,
  },
  mistakeCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  mistakeTitle: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  mistakeDesc: {
    color: '#FECACA',
    fontSize: 12,
  },
});
