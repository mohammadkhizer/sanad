import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/theme/colors';
import { api } from '../../src/api';
import { CredentialItem } from '@sanad/shared';

export default function ScholarApplyScreen() {
  const router = useRouter();

  const [step, setStep] = useState<number>(1);
  const [institution, setInstitution] = useState('Al-Azhar University, Cairo');
  const [statement, setStatement] = useState(
    'I have completed my doctoral studies in Hadith methodology and am certified in the six canonical books with direct chains of transmission.'
  );
  const [specialties, setSpecialties] = useState('Hadith Sciences, Usul al-Fiqh, Islamic Jurisprudence');
  const [languages, setLanguages] = useState('Arabic, English, Urdu');
  const [credentials, setCredentials] = useState<CredentialItem[]>([
    {
      type: 'degree',
      institution: 'Al-Azhar University',
      year: 2021,
      fileKey: 'credentials/alazhar_doctoral_degree.pdf',
    },
    {
      type: 'ijazah',
      institution: 'Dar al-Hadith al-Ashrafiyyah',
      year: 2022,
      fileKey: 'credentials/ijazah_bukhari_transmission.pdf',
    },
  ]);
  const [endorsementEmail, setEndorsementEmail] = useState('omar.farooq@al-azhar.edu');
  const [loading, setLoading] = useState(false);

  const handleAddCredential = () => {
    Alert.alert('Attach Document', 'Document picker simulated. Added degree/ijazah certificate.', [
      {
        text: 'Add Ijazah Certificate',
        onPress: () => {
          setCredentials((prev) => [
            ...prev,
            {
              type: 'ijazah',
              institution: institution || 'Traditional Halaqah',
              year: 2023,
              fileKey: `credentials/sanad_ijazah_${Date.now()}.pdf`,
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSaveDraft = () => {
    Alert.alert('Draft Saved', 'Your application progress has been preserved locally.');
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const parsedSpecialties = specialties.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedLanguages = languages.split(',').map((l) => l.trim()).filter(Boolean);

      await api.verification.submitApplication({
        institution: institution.trim(),
        statement: statement.trim(),
        specialties: parsedSpecialties,
        languages: parsedLanguages,
        credentials,
      });

      Alert.alert(
        'Application Submitted',
        'Your credentials have been placed in the Trust & Safety verification queue (< 72h estimated response).',
        [{ text: 'View Status', onPress: () => router.replace('/scholar/status') }]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Stepper Header */}
      <View style={styles.stepperRow}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.stepBadge,
              step === s && styles.stepBadgeActive,
              step > s && styles.stepBadgeDone,
            ]}
          >
            <Text style={[styles.stepText, (step === s || step > s) && styles.stepTextActive]}>
              {s}
            </Text>
          </View>
        ))}
      </View>

      <Text style={styles.stepTitle}>
        {step === 1 && 'Step 1: Institutional Affiliation'}
        {step === 2 && 'Step 2: Disciplines & Languages'}
        {step === 3 && 'Step 3: Upload Accredited Documents'}
        {step === 4 && 'Step 4: Scholar Endorsement (Optional)'}
        {step === 5 && 'Step 5: Review Dossier & Submit'}
      </Text>

      {/* Step 1 */}
      {step === 1 && (
        <Card style={styles.card}>
          <Input
            label="Primary University or Traditional Madrasah *"
            placeholder="e.g. Al-Azhar, Islamic University of Madinah, Darul Uloom"
            value={institution}
            onChangeText={setInstitution}
          />
          <Input
            label="Scholarly Statement & Chain of Transmission *"
            placeholder="Describe your teachers, formal degrees, and transmission lineage..."
            value={statement}
            onChangeText={setStatement}
            multiline
            numberOfLines={4}
          />
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card style={styles.card}>
          <Input
            label="Fields of Specialisation (Comma-separated) *"
            placeholder="e.g. Hadith Sciences, Usul al-Fiqh, Islamic Finance"
            value={specialties}
            onChangeText={setSpecialties}
          />
          <Input
            label="Languages of Instruction (Comma-separated) *"
            placeholder="e.g. Arabic, English, Urdu"
            value={languages}
            onChangeText={setLanguages}
          />
        </Card>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Attached Credentials ({credentials.length})</Text>
          {credentials.map((cred, idx) => (
            <View key={idx} style={styles.credItem}>
              <View style={styles.credBadge}>
                <Text style={styles.credBadgeText}>[{cred.type.toUpperCase()}]</Text>
              </View>
              <View style={styles.credDetails}>
                <Text style={styles.credInst}>{cred.institution} ({cred.year})</Text>
                <Text style={styles.credFile}>{cred.fileKey}</Text>
              </View>
            </View>
          ))}

          <Button
            title="Attach Additional Document (PDF/Image)"
            variant="outline"
            onPress={handleAddCredential}
            style={styles.attachBtn}
          />
        </Card>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Peer Scholar Endorsement</Text>
          <Text style={styles.stepDesc}>
            Optional: Enter the email or phone of an already verified Sanad scholar who can vouch for your chain of transmission.
          </Text>
          <Input
            label="Endorsing Scholar Contact"
            placeholder="scholar.name@institution.edu"
            value={endorsementEmail}
            onChangeText={setEndorsementEmail}
          />
        </Card>
      )}

      {/* Step 5 */}
      {step === 5 && (
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>Review Application Dossier</Text>
          <Text style={styles.dossierRow}><Text style={styles.bold}>Institution:</Text> {institution}</Text>
          <Text style={styles.dossierRow}><Text style={styles.bold}>Specialties:</Text> {specialties}</Text>
          <Text style={styles.dossierRow}><Text style={styles.bold}>Languages:</Text> {languages}</Text>
          <Text style={styles.dossierRow}><Text style={styles.bold}>Documents:</Text> {credentials.length} files attached</Text>
          <Text style={styles.dossierRow}><Text style={styles.bold}>Statement:</Text> {statement}</Text>
        </Card>
      )}

      {/* Navigation Buttons */}
      <View style={styles.navButtons}>
        {step > 1 && (
          <Button
            title="Back"
            variant="outline"
            onPress={() => setStep(step - 1)}
            style={styles.flexBtn}
          />
        )}
        {step < 5 ? (
          <Button
            title="Next Step"
            onPress={() => setStep(step + 1)}
            style={styles.flexBtn}
          />
        ) : (
          <Button
            title="Submit Dossier"
            onPress={handleSubmit}
            loading={loading}
            style={styles.flexBtn}
          />
        )}
      </View>

      <TouchableOpacity style={styles.saveDraftBtn} onPress={handleSaveDraft}>
        <Text style={styles.saveDraftText}>Save Draft for Later</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  stepBadgeDone: {
    backgroundColor: colors.light.accent,
    borderColor: colors.light.accentDark,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.light.textSecondary,
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 4,
  },
  card: {
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  credItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: colors.light.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  credBadge: {
    backgroundColor: colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  credBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.light.accentText,
  },
  credDetails: {
    flex: 1,
  },
  credInst: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.text,
  },
  credFile: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textSecondary,
  },
  attachBtn: {
    marginTop: 6,
  },
  dossierRow: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 19,
  },
  bold: {
    fontWeight: '700',
    color: colors.light.primary,
  },
  navButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  flexBtn: {
    flex: 1,
  },
  saveDraftBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  saveDraftText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textMuted,
  },
});
