// ============================================================================
// ARCHIVO: src/components/PaywallModal.tsx
// DESCRIPCION: Pantalla modal de monetizacion hibrida para FitPulse Pro.
// Permite al usuario desbloquear funciones Pro mediante suscripcion anual,
// pase semanal o viendo un anuncio de video recompensado sin pagar dinero.
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';

interface PaywallModalProps {
  visible: boolean;
  isPro: boolean;
  onClose: () => void;
  onUnlockPro: (method: 'annual' | 'weekly' | 'rewarded_ad') => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  isPro,
  onClose,
  onUnlockPro,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'weekly'>('annual');
  const [watchingAd, setWatchingAd] = useState(false);

  const handleSimulateRewardedAd = () => {
    setWatchingAd(true);
    setTimeout(() => {
      setWatchingAd(false);
      onUnlockPro('rewarded_ad');
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>FITPULSE PRO • MONETIZACIÓN HÍBRIDA</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>
              Desbloquea tu máximo potencial físico
            </Text>
            <Text style={styles.subtitle}>
              Generador de Rutinas IA ilimitado, analítica avanzada de 1RM y gráficos de volumen muscular sin límites.
            </Text>

            <View style={styles.benefitsBox}>
              {[
                '🤖 Coach IA: Rutinas hiper-personalizadas al instante',
                '📈 Cálculo automático de Récords Personales (1RM Epley)',
                '⏱️ Temporizador inteligente con alertas por grupo muscular',
                '☁️ Respaldo ilimitado y exportación de progreso en PDF/CSV',
              ].map((benefit, idx) => (
                <View key={idx} style={styles.benefitItem}>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {/* Plan Anual */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'annual' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('annual')}
            >
              <View style={styles.saveRibbon}>
                <Text style={styles.saveRibbonText}>AHORRA 65% • 7 DÍAS GRATIS</Text>
              </View>
              <View style={styles.planRow}>
                <View>
                  <Text style={styles.planName}>Plan Anual Pro</Text>
                  <Text style={styles.planDesc}>Equivale a solo $2.49 USD / mes</Text>
                </View>
                <Text style={styles.planPrice}>$29.99 / año</Text>
              </View>
            </TouchableOpacity>

            {/* Plan Semanal */}
            <TouchableOpacity
              style={[
                styles.planCard,
                selectedPlan === 'weekly' && styles.planCardSelected,
              ]}
              onPress={() => setSelectedPlan('weekly')}
            >
              <View style={styles.planRow}>
                <View>
                  <Text style={styles.planName}>Pase Semanal Flexible</Text>
                  <Text style={styles.planDesc}>Cancela cuando quieras en 1 toque</Text>
                </View>
                <Text style={styles.planPrice}>$2.99 / sem</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => onUnlockPro(selectedPlan)}
            >
              <Text style={styles.primaryCtaText}>
                {isPro
                  ? '✓ Ya eres miembro FitPulse PRO'
                  : selectedPlan === 'annual'
                  ? 'Comenzar Prueba Gratis de 7 Días'
                  : 'Suscribirme al Pase Semanal'}
              </Text>
            </TouchableOpacity>

            {/* Opción Híbrida: Rewarded Video Ad */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O DESBLOQUEA GRATIS HOY</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.rewardedAdBtn}
              onPress={handleSimulateRewardedAd}
              disabled={watchingAd}
            >
              <Text style={styles.rewardedAdTitle}>
                {watchingAd
                  ? '⏳ Reproduciendo Anuncio de Video (AdMob)...'
                  : '🎬 Ver 1 Anuncio Corto → Desbloquear pase PRO 24h'}
              </Text>
              <Text style={styles.rewardedAdSub}>
                Ejemplo real de monetización híbrida (Rewarded Video eCPM $12-$28 USD en Tier 1)
              </Text>
            </TouchableOpacity>

            <Text style={styles.footerLegal}>
              Modo Portafolio / Demo interactiva lista para conectar con RevenueCat SDK y Google Play Billing.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '92%',
    borderTopWidth: 1,
    borderColor: '#1F2937',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  proBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  proBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 6,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  benefitsBox: {
    backgroundColor: '#090D16',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1F2937',
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: '#090D16',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#1F2937',
  },
  planCardSelected: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  saveRibbon: {
    alignSelf: 'flex-start',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  saveRibbonText: {
    color: '#052E16',
    fontSize: 10,
    fontWeight: '900',
  },
  planRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '800',
  },
  planDesc: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  planPrice: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '900',
  },
  primaryCta: {
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryCtaText: {
    color: '#052E16',
    fontSize: 15,
    fontWeight: '900',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F2937',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '800',
    marginHorizontal: 10,
  },
  rewardedAdBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
    borderWidth: 1,
    borderRadius: 14,
    padding: 13,
    alignItems: 'center',
  },
  rewardedAdTitle: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '800',
  },
  rewardedAdSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  footerLegal: {
    color: '#6B7280',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
  },
});
