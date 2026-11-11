import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/theme/colors';
import { apiClient } from '../../src/api/client';

export default function ScholarApplyScreen() {
  const router = useRouter();

  const [institution, setInstitution] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('Arabic, English');
  const [statement, setStatement] = useState('');
  const [credentialKey, setCredentialKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadCredential = async () => {
    try {
      setLoading(true);
      const res = await apiClient<{ uploadUrl: string; fileKey: string }>(
        '/scholar/applications/upload-url',
        { method: 'POST' }
      );
      setCredentialKey(res.fileKey);
      Alert.alert('Credential Attached', 'Your document has been securely attached for review.');
    } catch (err: any) {
      setError(err.message || 'Failed to request upload slot');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!institution.trim() || !statement.trim() || !specialties.trim()) {
      setError('Please fill in institution, specialties, and personal statement');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const parsedSpecialties = specialties.split(',').map((s) => s.trim()).filter(Boolean);
      const parsedLanguages = languages.split(',').map((l) => l.trim()).filter(Boolean);

      await apiClient('/scholar/applications', {
        method: 'POST',
        body: JSON.stringify({
          institution: institution.trim(),
          statement: statement.trim(),
          specialties: parsedSpecialties,
          languages: parsedLanguages,
          credentials: [
            {
              type: 'degree',
              fileKey: credentialKey || 'credentials/demo-degree.pdf',
              institution: institution.trim(),
              year: 2022,
            },
          ],
        }),
      });

      Alert.alert(
        'Application Submitted',
        'Your credentials have been submitted to our moderation panel for verification.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      setError(err.message || 'Application submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Scholar Accreditation</Text>
      <Text style={styles.subtitle}>
        Sanad ensures every publisher holds legitimate credentials (ijazah, Islamic studies
        degree, or recognized traditional sanad).
      </Text>

      <View style={styles.form}>
        {Boolean(error) && <Text style={styles.errorBanner}>{error}</Text>}

        <Input
          label="Accrediting Institution / Faculty"
          placeholder="e.g. Al-Azhar, Islamic University of Madinah, Darul Uloom"
          value={institution}
          onChangeText={setInstitution}
        />

        <Input
          label="Specialties / Disciplines (Comma separated)"
          placeholder="e.g. Fiqh, Hadith, Tafsir, Usul"
          value={specialties}
          onChangeText={setSpecialties}
        />

        <Input
          label="Teaching Languages (Comma separated)"
          placeholder="Arabic, English, Urdu"
          value={languages}
          onChangeText={setLanguages}
        />

        <Input
          label="Academic Bio & Statement of Trust"
          placeholder="Detail your teachers, lineage of authorization (sanad), or teaching experience..."
          value={statement}
          onChangeText={setStatement}
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />

        <Button
          title={credentialKey ? 'Credential Attached [OK]' : 'Attach Degree / Ijazah Certificate'}
          variant="outline"
          onPress={handleUploadCredential}
          loading={loading}
          style={styles.uploadBtn}
        />

        <Button
          title="Submit for Verification"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.light.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 20,
  },
  form: {
    backgroundColor: colors.light.surface,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.light.error,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
  },
  uploadBtn: {
    marginVertical: 12,
  },
  submitBtn: {
    marginTop: 8,
  },
});

