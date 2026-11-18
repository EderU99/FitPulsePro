// ============================================================================
// ARCHIVO: src/components/RestTimerModal.tsx
// DESCRIPCION: Barra de temporizador de descanso activo entre series.
// Se activa automaticamente al marcar una serie como completada y permite
// elegir tiempos de 60s, 90s, 120s o sumar y restar bloques de 15 segundos.
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { formatSeconds } from '../utils/storage';

interface RestTimerBarProps {
  remainingSeconds: number;
  totalSeconds: number;
  exerciseName: string;
  onAdjustTime: (deltaSeconds: number) => void;
  onSkip: () => void;
  onSelectPreset: (seconds: number) => void;
}

export const RestTimerBar: React.FC<RestTimerBarProps> = ({
  remainingSeconds,
  totalSeconds,
  exerciseName,
  onAdjustTime,
  onSkip,
  onSelectPreset,
}) => {
  if (remainingSeconds <= 0) return null;

  const progress = Math.min(1, Math.max(0, remainingSeconds / Math.max(1, totalSeconds)));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <View style={styles.liveDot} />
          <Text style={styles.label}>DESCANSO ACTIVO</Text>
          <Text style={styles.exerciseText} numberOfLines={1}>
            • {exerciseName}
          </Text>
        </View>
        <Text style={styles.timerValue}>{formatSeconds(remainingSeconds)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.presetsGroup}>
          {[60, 90, 120].map((sec) => (
            <TouchableOpacity
              key={sec}
              style={[
                styles.presetChip,
                totalSeconds === sec && styles.presetChipActive,
              ]}
              onPress={() => onSelectPreset(sec)}
            >
              <Text
                style={[
                  styles.presetChipText,
                  totalSeconds === sec && styles.presetChipTextActive,
                ]}
              >
                {sec}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => onAdjustTime(-15)}
          >
            <Text style={styles.adjustBtnText}>-15s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() => onAdjustTime(15)}
          >
            <Text style={styles.adjustBtnText}>+15s</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={onSkip}>
            <Text style={styles.skipBtnText}>Saltar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  label: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  exerciseText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
  },
  timerValue: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  presetChip: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1F2937',
  },
  presetChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  presetChipText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  presetChipTextActive: {
    color: '#10B981',
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  adjustBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  adjustBtnText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '700',
  },
  skipBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipBtnText: {
    color: '#052E16',
    fontSize: 12,
    fontWeight: '800',
  },
});
