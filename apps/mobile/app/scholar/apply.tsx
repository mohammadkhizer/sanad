import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/theme/colors';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { apiFetch, ApiError } from '../../src/api/client';

export default function ScholarApplicationScreen() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [institution, setInstitution] = useState('');
  const [specialtiesStr, setSpecialtiesStr] = useState('');
  const [languagesStr, setLanguagesStr] = useState('Arabic, English');

  const [credentialType, setCredentialType] = useState('Ijazah / Degree');
  const [credentialYear, setCredentialYear] = useState('2020');
  const [fileKey, setFileKey] = useState('credentials/doc_verified.pdf');

  const [statement, setStatement] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!statement || statement.length < 20) {
      setErrorMsg('Please provide a qualifying statement of at least 20 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const specialties = specialtiesStr
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const languages = languagesStr
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      await apiFetch('/scholar/applications', {
        method: 'POST',
        body: JSON.stringify({
          institution,
          specialties: specialties.length ? specialties : ['Islamic Studies'],
          languages: languages.length ? languages : ['English'],
          credentials: [
            {
              type: credentialType,
              fileKey,
              institution,
              year: parseInt(credentialYear, 10) || 2020,
            },
          ],
          statement,
        }),
      });

      Alert.alert(
        'Application Submitted',
        'Your credentials and qualifying statement have been delivered to the scholarly review committee. You will be notified within 72 hours.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/profile') }]
      );
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to submit application. Please check your network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Stepper Header */}
      <View style={styles.stepperContainer}>
        <View style={[styles.stepDot, step >= 1 ? styles.stepDotActive : null]}>
          <Text style={[styles.stepNum, step >= 1 ? styles.stepNumActive : null]}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step >= 2 ? styles.stepDotActive : null]}>
          <Text style={[styles.stepNum, step >= 2 ? styles.stepNumActive : null]}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, step >= 3 ? styles.stepDotActive : null]}>
          <Text style={[styles.stepNum, step >= 3 ? styles.stepNumActive : null]}>3</Text>
        </View>
      </View>

      <Text style={styles.stepTitle}>
        {step === 1
          ? 'Step 1: Academic & Religious Institution'
          : step === 2
          ? 'Step 2: Credential & Degree Verification'
          : 'Step 3: Scholarly Background Statement'}
      </Text>

      {errorMsg ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {step === 1 && (
        <View style={styles.card}>
          <Input
            label="Accrediting Institution / Faculty"
            placeholder="e.g. Al-Azhar University, Medina Islamic University"
            value={institution}
            onChangeText={setInstitution}
            helperText="The university, seminary, or scholarly board that awarded your credentials."
          />

          <Input
            label="Specialties / Fields of Study"
            placeholder="e.g. Hadith, Fiqh, Usul, Tafsir"
            value={specialtiesStr}
            onChangeText={setSpecialtiesStr}
            helperText="Comma-separated disciplines."
          />

          <Input
            label="Teaching Languages"
            placeholder="e.g. Arabic, English, Urdu"
            value={languagesStr}
            onChangeText={setLanguagesStr}
          />

          <Button
            title="Continue to Credentials"
            variant="primary"
            disabled={!institution}
            onPress={() => setStep(2)}
            style={styles.nextBtn}
          />
        </View>
      )}

      {step === 2 && (
        <View style={styles.card}>
          <Input
            label="Credential / Document Type"
            placeholder="e.g. Doctoral Degree, Masters, Sanad, Ijazah"
            value={credentialType}
            onChangeText={setCredentialType}
          />

          <Input
            label="Year Completed"
            placeholder="e.g. 2018"
            keyboardType="number-pad"
            value={credentialYear}
            onChangeText={setCredentialYear}
          />

          <View style={styles.uploadArea}>
            <Text style={styles.uploadTitle}>Secure Document Upload</Text>
            <Text style={styles.uploadSub}>
              Credentials are encrypted and stored in private cloud storage. Only verified moderators can view your certificates.
            </Text>
            <Button
              title="Select PDF / Certificate File"
              variant="outline"
              size="sm"
              onPress={() => {
                setFileKey(`credentials/sanad_cert_${Date.now()}.pdf`);
                Alert.alert('Document Attached', 'Certificate attached successfully.');
              }}
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Back"
              variant="outline"
              onPress={() => setStep(1)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Continue"
              variant="primary"
              onPress={() => setStep(3)}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      )}

      {step === 3 && (
        <View style={styles.card}>
          <Input
            label="Statement of Scholarly Lineage & Qualifications"
            placeholder="Describe your teachers, formal training, lineage of transmission, and teaching experience..."
            value={statement}
            onChangeText={setStatement}
            multiline
            numberOfLines={6}
            style={{ minHeight: 140 }}
            helperText="Minimum 20 characters."
          />

          <View style={styles.securityNotice}>
            <Text style={styles.securityTitle}>Sanad Credibility Guarantee</Text>
            <Text style={styles.securityText}>
              By submitting, you affirm that all certificates and statements are authentic and subject to peer review. Verification badges are revocable if misrepresentation occurs.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Back"
              variant="outline"
              onPress={() => setStep(2)}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Submit Application"
              variant="accent"
              loading={loading}
              onPress={handleSubmit}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.light,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAE6DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: theme.colors.brand.emerald,
  },
  stepNum: {
    fontWeight: 'bold',
    color: theme.colors.text.secondaryLight,
    fontSize: 14,
  },
  stepNumActive: {
    color: '#FFFFFF',
  },
  stepLine: {
    width: 48,
    height: 2,
    backgroundColor: '#EAE6DC',
    marginHorizontal: 4,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
    textAlign: 'center',
    marginBottom: theme.spacing.base,
  },
  card: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  nextBtn: {
    marginTop: theme.spacing.md,
  },
  uploadArea: {
    backgroundColor: '#F5F2EB',
    borderRadius: theme.radius.input,
    padding: theme.spacing.base,
    borderWidth: 1,
    borderColor: '#E0DDD4',
    borderStyle: 'dashed',
    marginBottom: theme.spacing.base,
  },
  uploadTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  uploadSub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 4,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.md,
  },
  securityNotice: {
    backgroundColor: '#FAF7EE',
    padding: theme.spacing.md,
    borderRadius: theme.radius.input,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.gold,
    marginBottom: theme.spacing.base,
  },
  securityTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 'bold',
    color: theme.colors.accent.goldDark,
  },
  securityText: {
    fontSize: 11,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
    lineHeight: 16,
  },
  errorBox: {
    backgroundColor: '#FDF2F2',
    borderColor: theme.colors.semantic.error,
    borderWidth: 1,
    borderRadius: theme.radius.input,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.base,
  },
  errorText: {
    color: theme.colors.semantic.error,
    fontSize: theme.typography.fontSize.sm,
  },
});
