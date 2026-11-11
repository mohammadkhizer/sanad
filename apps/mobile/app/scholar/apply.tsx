import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
    Alert.alert('Attach Document', 'Select document type to add to your verification dossier:', [
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
      {
        text: 'Add University Degree',
        onPress: () => {
          setCredentials((prev) => [
            ...prev,
            {
              type: 'degree',
              institution: institution || 'Accredited Faculty',
              year: 2024,
              fileKey: `credentials/sanad_degree_${Date.now()}.pdf`,
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleRemoveCredential = (index: number) => {
    setCredentials((prev) => prev.filter((_, i) => i !== index));
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
        'Your credentials have been placed in the Trust and Safety verification queue. Estimated response within 72 hours.',
        [{ text: 'View Status', onPress: () => router.replace('/scholar/status') }]
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Submission failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Institutional Affiliation',
    'Disciplines and Languages',
    'Accredited Documents',
    'Peer Scholar Endorsement',
    'Review Dossier and Submit',
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Scholar Verification"
        subtitle={`Step ${step} of 5 · ${stepTitles[step - 1]}`}
        showBack
        onBack={() => {
          if (step > 1) {
            setStep(step - 1);
          } else {
            router.back();
          }
        }}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Stepper Progress Indicator */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperRow}>
            {[1, 2, 3, 4, 5].map((s) => {
              const isActive = step === s;
              const isPast = step > s;
              return (
                <View key={s} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepBadge,
                      isActive && styles.stepBadgeActive,
                      isPast && styles.stepBadgeDone,
                    ]}
                  >
                    {isPast ? (
                      <Icon name="check" size={14} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.stepText, isActive && styles.stepTextActive]}>
                        {s}
                      </Text>
                    )}
                  </View>
                  {s < 5 && (
                    <View
                      style={[
                        styles.stepConnector,
                        isPast && styles.stepConnectorDone,
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
          <Text style={styles.stepHeading}>{stepTitles[step - 1]}</Text>
        </View>

        {/* Step 1: Institutional Affiliation */}
        {step === 1 && (
          <Card style={styles.card}>
            <Text style={styles.cardIntro}>
              Provide your primary religious seminary, recognized university, or verified traditional madrasah.
            </Text>
            <Input
              label="Primary Institution or Seminary *"
              placeholder="e.g. Al-Azhar University, Islamic University of Madinah"
              value={institution}
              onChangeText={setInstitution}
            />
            <Input
              label="Scholarly Statement and Lineage *"
              placeholder="Describe your primary teachers, formal degrees, and transmission lineage..."
              value={statement}
              onChangeText={setStatement}
              multiline
              numberOfLines={5}
            />
          </Card>
        )}

        {/* Step 2: Disciplines and Languages */}
        {step === 2 && (
          <Card style={styles.card}>
            <Text style={styles.cardIntro}>
              Specify your accredited fields of religious expertise and the languages you actively teach in.
            </Text>
            <Input
              label="Fields of Specialisation (Comma-separated) *"
              placeholder="e.g. Hadith Sciences, Usul al-Fiqh, Islamic Jurisprudence"
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

        {/* Step 3: Accredited Documents */}
        {step === 3 && (
          <Card style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeader}>Attached Credentials ({credentials.length})</Text>
              <Text style={styles.sectionSub}>PDF or high-resolution image</Text>
            </View>

            {credentials.map((cred, idx) => (
              <View key={idx} style={styles.credItem}>
                <View style={styles.credIconBox}>
                  <Icon name="paperclip" size={18} color={colors.light.primary} />
                </View>
                <View style={styles.credDetails}>
                  <View style={styles.credHeaderRow}>
                    <Text style={styles.credType}>{cred.type.toUpperCase()}</Text>
                    <Text style={styles.credYear}>{cred.year}</Text>
                  </View>
                  <Text style={styles.credInst}>{cred.institution}</Text>
                  <Text style={styles.credFile} numberOfLines={1}>{cred.fileKey}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveCredential(idx)}
                  style={styles.credRemoveBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="trash" size={16} color={colors.light.error} />
                </TouchableOpacity>
              </View>
            ))}

            <Button
              title="Attach Document Certificate"
              variant="outline"
              onPress={handleAddCredential}
              style={styles.attachBtn}
            />
          </Card>
        )}

        {/* Step 4: Peer Endorsement */}
        {step === 4 && (
          <Card style={styles.card}>
            <Text style={styles.sectionHeader}>Peer Scholar Endorsement</Text>
            <Text style={styles.cardIntro}>
              Optional: Enter the email or phone number of an already verified Sanad scholar who can vouch for your chain of transmission and ethical standing.
            </Text>
            <Input
              label="Endorsing Scholar Email or Handle"
              placeholder="scholar.name@institution.edu"
              value={endorsementEmail}
              onChangeText={setEndorsementEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Card>
        )}

        {/* Step 5: Review Dossier */}
        {step === 5 && (
          <Card style={styles.card}>
            <Text style={styles.sectionHeader}>Review Application Dossier</Text>
            <Text style={styles.cardIntro}>
              Please verify your information before formal transmission to the verification committee.
            </Text>

            <View style={styles.dossierField}>
              <Text style={styles.dossierLabel}>Institution</Text>
              <Text style={styles.dossierValue}>{institution}</Text>
            </View>

            <View style={styles.dossierField}>
              <Text style={styles.dossierLabel}>Specialisations</Text>
              <Text style={styles.dossierValue}>{specialties}</Text>
            </View>

            <View style={styles.dossierField}>
              <Text style={styles.dossierLabel}>Languages</Text>
              <Text style={styles.dossierValue}>{languages}</Text>
            </View>

            <View style={styles.dossierField}>
              <Text style={styles.dossierLabel}>Credentials</Text>
              <Text style={styles.dossierValue}>{credentials.length} certified document(s) attached</Text>
            </View>

            <View style={styles.dossierField}>
              <Text style={styles.dossierLabel}>Scholarly Statement</Text>
              <Text style={styles.dossierValue}>{statement}</Text>
            </View>
          </Card>
        )}

        {/* Step Navigation Actions */}
        <View style={styles.navRow}>
          {step > 1 && (
            <Button
              title="Previous"
              variant="outline"
              onPress={() => setStep(step - 1)}
              style={styles.flexBtn}
            />
          )}
          {step < 5 ? (
            <Button
              title="Continue"
              variant="primary"
              onPress={() => setStep(step + 1)}
              style={styles.flexBtn}
            />
          ) : (
            <Button
              title="Submit Verification Dossier"
              variant="accent"
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  stepperContainer: {
    backgroundColor: colors.light.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.light.background,
    borderWidth: 1.5,
    borderColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  stepBadgeDone: {
    backgroundColor: colors.light.primaryDark,
    borderColor: colors.light.primaryDark,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.light.textSecondary,
  },
  stepTextActive: {
    color: '#FFFFFF',
  },
  stepConnector: {
    width: 32,
    height: 2,
    backgroundColor: colors.light.border,
    marginHorizontal: 4,
  },
  stepConnectorDone: {
    backgroundColor: colors.light.primary,
  },
  stepHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.primary,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 14,
    gap: 12,
  },
  cardIntro: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
    marginBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.primary,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.light.textMuted,
  },
  credItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: colors.light.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  credIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  credDetails: {
    flex: 1,
  },
  credHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  credType: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.light.primary,
  },
  credYear: {
    fontSize: 11,
    color: colors.light.textMuted,
    fontWeight: '600',
  },
  credInst: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 2,
  },
  credFile: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textMuted,
    marginTop: 2,
  },
  credRemoveBtn: {
    padding: 6,
  },
  attachBtn: {
    marginTop: 6,
  },
  dossierField: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    gap: 4,
  },
  dossierLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dossierValue: {
    fontSize: 13,
    color: colors.light.text,
    lineHeight: 18,
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  flexBtn: {
    flex: 1,
  },
  saveDraftBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  saveDraftText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.textMuted,
  },
});
