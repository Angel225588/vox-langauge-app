/**
 * Privacy Dashboard Screen
 *
 * "Your Data" — shows what we collect, data counts, export/delete controls.
 * GDPR compliant: data portability (Article 20) + right to erasure (Article 17).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/hooks/useAuth';
import { getAllConsents, type AllConsents } from '@/lib/privacy/consentManager';
import { exportUserDataAsString } from '@/lib/privacy/dataExport';
import { deleteAllUserData } from '@/lib/privacy/dataDelete';
import { getConversationStats } from '@/lib/db/conversations';
import { getUserMemory } from '@/lib/ai/userMemory';

// ─── Palette ───
const C = {
  bg: '#080B14',
  card: 'rgba(255,255,255,0.06)',
  card2: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.06)',
  text: '#EEF0F6',
  sub: '#7E8BA4',
  dim: '#3E4862',
  blue: '#1A6DFF',
  green: '#10B981',
  gold: '#F59E0B',
  red: '#EF4444',
  cyan: '#00D2FF',
};

// What we collect
const DATA_WE_COLLECT = [
  { icon: 'mic-outline', label: 'Voice conversations', purpose: 'AI practice + feedback', color: C.cyan },
  { icon: 'book-outline', label: 'Practice scores', purpose: 'Track improvement', color: C.blue },
  { icon: 'library-outline', label: 'Vocabulary progress', purpose: 'Spaced repetition', color: C.green },
  { icon: 'person-outline', label: 'Learning profile', purpose: 'Personalized content', color: C.gold },
];

// What we never collect
const DATA_WE_NEVER_COLLECT = [
  'Location / GPS',
  'Contacts',
  'Photos',
  'Browsing history',
  'Other app usage',
  'Biometric data',
];

export default function PrivacyDashboardScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [consents, setConsents] = useState<AllConsents | null>(null);
  const [stats, setStats] = useState<{ sessions: number; vocab: number; minutes: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [c, s, m] = await Promise.all([
        getAllConsents(),
        getConversationStats(user.id),
        getUserMemory(user.id),
      ]);
      setConsents(c);
      setStats({
        sessions: s?.totalSessions || 0,
        vocab: m?.total_vocab_learned || 0,
        minutes: s?.totalMinutes || 0,
      });
    } catch (err) {
      console.warn('[PrivacyDashboard] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleExport = async () => {
    if (!user?.id || exporting) return;
    setExporting(true);
    try {
      const jsonString = await exportUserDataAsString(user.id);
      await Share.share({
        message: jsonString,
        title: 'Vox Language — Your Data Export',
      });
    } catch (err) {
      Alert.alert('Export Failed', 'Could not export your data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = () => {
    if (!user?.id) return;
    Alert.alert(
      'Delete All Data?',
      `This will permanently delete:\n\n` +
      `• ${stats?.sessions || 0} conversation sessions\n` +
      `• ${stats?.vocab || 0} vocabulary items\n` +
      `• All practice scores\n` +
      `• Your AI learning profile\n` +
      `• All local data\n\n` +
      `This action CANNOT be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const result = await deleteAllUserData(user.id);
              if (result.success) {
                Alert.alert(
                  'Data Deleted',
                  'All your data has been permanently deleted. You will be signed out.',
                  [{
                    text: 'OK',
                    onPress: async () => {
                      await signOut();
                      router.replace('/');
                    },
                  }]
                );
              } else {
                Alert.alert(
                  'Partial Deletion',
                  `Most data was deleted, but some errors occurred:\n${result.errors.join(', ')}\n\nPlease try again or contact support.`
                );
              }
            } catch {
              Alert.alert('Deletion Failed', 'Could not delete your data. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={s.container}>
        <Header onBack={() => router.back()} />
        <View style={s.center}>
          <ActivityIndicator size="large" color={C.blue} />
          <Text style={s.loadingText}>Loading your data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container}>
      <Header onBack={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* ═══ SHIELD HEADER ═══ */}
        <Animated.View entering={FadeInDown.duration(350)} style={s.shieldCard}>
          <View style={s.shieldIcon}>
            <Ionicons name="shield-checkmark" size={28} color={C.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.shieldTitle}>Your data is protected</Text>
            <Text style={s.shieldSub}>Encrypted storage, no ads, no data selling</Text>
          </View>
        </Animated.View>

        {/* ═══ DATA SUMMARY ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(60)}>
          <Text style={s.sectionTitle}>Your Data Summary</Text>
          <View style={s.statsRow}>
            <StatBox label="Sessions" value={stats?.sessions || 0} icon="chatbubbles" color={C.cyan} />
            <StatBox label="Vocab" value={stats?.vocab || 0} icon="library" color={C.green} />
            <StatBox label="Minutes" value={stats?.minutes || 0} icon="time" color={C.gold} />
          </View>
        </Animated.View>

        {/* ═══ DATA RIGHTS ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(120)}>
          <Text style={s.sectionTitle}>Your Data Rights</Text>
          <View style={{ gap: 8 }}>
            {/* Export */}
            <TouchableOpacity
              style={s.actionCard}
              onPress={handleExport}
              activeOpacity={0.7}
              disabled={exporting}
            >
              <View style={[s.actionIcon, { backgroundColor: C.blue + '18' }]}>
                {exporting ? (
                  <ActivityIndicator size="small" color={C.blue} />
                ) : (
                  <Ionicons name="download-outline" size={20} color={C.blue} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.actionLabel}>Download Your Data</Text>
                <Text style={s.actionDesc}>Export everything as JSON (GDPR Article 20)</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.dim} />
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={s.actionCard}
              onPress={handleDelete}
              activeOpacity={0.7}
              disabled={deleting}
            >
              <View style={[s.actionIcon, { backgroundColor: C.red + '18' }]}>
                {deleting ? (
                  <ActivityIndicator size="small" color={C.red} />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={C.red} />
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.actionLabel, { color: C.red }]}>Delete All Data</Text>
                <Text style={s.actionDesc}>Permanently remove everything (GDPR Article 17)</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={C.dim} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ═══ CONSENT STATUS ═══ */}
        {consents && (
          <Animated.View entering={FadeInDown.duration(350).delay(180)}>
            <Text style={s.sectionTitle}>Consent Status</Text>
            <View style={s.consentCard}>
              <ConsentRow
                label="Voice Recording"
                accepted={consents.voiceRecording.accepted}
                date={consents.voiceRecording.acceptedAt}
              />
              <ConsentRow
                label="Privacy Policy"
                accepted={consents.privacyPolicy.accepted}
                date={consents.privacyPolicy.acceptedAt}
              />
              <ConsentRow
                label="Terms of Service"
                accepted={consents.termsOfService.accepted}
                date={consents.termsOfService.acceptedAt}
                isLast
              />
            </View>
          </Animated.View>
        )}

        {/* ═══ WHAT WE COLLECT ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(240)}>
          <Text style={s.sectionTitle}>What We Collect</Text>
          <View style={{ gap: 6 }}>
            {DATA_WE_COLLECT.map((item) => (
              <View key={item.label} style={s.collectRow}>
                <Ionicons name={item.icon as any} size={18} color={item.color} />
                <View style={{ flex: 1 }}>
                  <Text style={s.collectLabel}>{item.label}</Text>
                  <Text style={s.collectPurpose}>{item.purpose}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ═══ WHAT WE NEVER COLLECT ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(300)}>
          <Text style={s.sectionTitle}>What We Never Collect</Text>
          <View style={s.neverCard}>
            {DATA_WE_NEVER_COLLECT.map((item) => (
              <View key={item} style={s.neverRow}>
                <Ionicons name="close-circle" size={14} color={C.red + '80'} />
                <Text style={s.neverText}>{item}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ═══ THIRD PARTY ═══ */}
        <Animated.View entering={FadeInDown.duration(350).delay(360)}>
          <Text style={s.sectionTitle}>Third-Party Services</Text>
          <View style={s.thirdPartyCard}>
            <Text style={s.tpText}>
              Vox uses Google Gemini for AI content generation and ElevenLabs for voice conversations.
              Your conversation data is processed by these services to provide feedback.
              We do not share your personal profile, scores, or vocabulary data with any third party.
            </Text>
            <Text style={[s.tpText, { marginTop: 8 }]}>
              Auth tokens are stored using encrypted device storage (Keychain/Keystore).
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── SUB-COMPONENTS ───

function Header({ onBack }: { onBack: () => void }) {
  return (
    <View style={s.header}>
      <TouchableOpacity onPress={onBack} hitSlop={12}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </TouchableOpacity>
      <Text style={s.headerTitle}>Privacy & Data</Text>
      <View style={{ width: 22 }} />
    </View>
  );
}

function StatBox({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <View style={s.statBox}>
      <Ionicons name={icon as any} size={16} color={color} />
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function ConsentRow({ label, accepted, date, isLast }: { label: string; accepted: boolean; date: string | null; isLast?: boolean }) {
  return (
    <View style={[s.consentRow, !isLast && s.consentRowBorder]}>
      <Ionicons
        name={accepted ? 'checkmark-circle' : 'ellipse-outline'}
        size={18}
        color={accepted ? C.green : C.dim}
      />
      <View style={{ flex: 1 }}>
        <Text style={s.consentLabel}>{label}</Text>
        {date && (
          <Text style={s.consentDate}>
            Accepted {new Date(date).toLocaleDateString()}
          </Text>
        )}
      </View>
      <Text style={[s.consentStatus, { color: accepted ? C.green : C.dim }]}>
        {accepted ? 'Granted' : 'Pending'}
      </Text>
    </View>
  );
}

// ─── STYLES ───
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  scroll: { padding: 16, paddingBottom: 100 },
  loadingText: { color: C.sub, fontSize: 14, marginTop: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: C.text },

  sectionTitle: {
    fontSize: 13, fontWeight: '700', color: C.sub, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 10, marginTop: 20,
  },

  // Shield
  shieldCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.green + '10', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.green + '20',
  },
  shieldIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.green + '15', alignItems: 'center', justifyContent: 'center',
  },
  shieldTitle: { fontSize: 15, fontWeight: '700', color: C.text },
  shieldSub: { fontSize: 11, color: C.sub, marginTop: 2 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },
  statBox: {
    flex: 1, backgroundColor: C.card, borderRadius: 12, padding: 12,
    alignItems: 'center', gap: 4, borderWidth: 1, borderColor: C.border,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '600', color: C.dim, textTransform: 'uppercase' },

  // Action cards
  actionCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  actionLabel: { fontSize: 14, fontWeight: '700', color: C.text },
  actionDesc: { fontSize: 10, color: C.sub, marginTop: 1 },

  // Consent
  consentCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  consentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10,
  },
  consentRowBorder: {
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  consentLabel: { fontSize: 13, fontWeight: '600', color: C.text },
  consentDate: { fontSize: 9, color: C.dim, marginTop: 1 },
  consentStatus: { fontSize: 11, fontWeight: '700' },

  // What we collect
  collectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: C.border,
  },
  collectLabel: { fontSize: 12, fontWeight: '700', color: C.text },
  collectPurpose: { fontSize: 10, color: C.sub },

  // Never collect
  neverCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border, gap: 6,
  },
  neverRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  neverText: { fontSize: 12, color: C.sub },

  // Third party
  thirdPartyCard: {
    backgroundColor: C.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.border,
  },
  tpText: { fontSize: 12, color: C.sub, lineHeight: 18 },
});
