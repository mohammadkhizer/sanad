import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { api } from '../../src/api';

export default function DataExportScreen() {
  const [loading, setLoading] = useState(false);
  const [exportInfo, setExportInfo] = useState<{ url: string; expiresAt: string } | null>(null);

  const handleRequestExport = async () => {
    setLoading(true);
    try {
      const res = await api.users.exportData();
      setExportInfo({ url: res.exportUrl, expiresAt: res.expiresAt });
      Alert.alert(
        'Archive Prepared',
        'Your scholarly activity, profile metadata, and consultation log have been packaged for export.'
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Export failed';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.title}>Export Your Sanad Data</Text>
        <Text style={styles.desc}>
          In accordance with digital data ownership standards, you can download a complete archive of your posts, lessons, comments, followers, and consultation transcripts.
        </Text>

        <Text style={styles.formatHeading}>Archive Contents:</Text>
        <Text style={styles.bulletPoint}>- Profile & Institutional Accreditation Metadata (JSON)</Text>
        <Text style={styles.bulletPoint}>- Published Lessons, Videos & Transcripts (JSON + Media Links)</Text>
        <Text style={styles.bulletPoint}>- Chat Messages & Consultation Inquiries (JSON)</Text>
        <Text style={styles.bulletPoint}>- Followers & Following Scholarly Network (JSON)</Text>

        {exportInfo ? (
          <View style={styles.downloadBox}>
            <Text style={styles.downloadTitle}>Archive Ready for Download</Text>
            <Text style={styles.downloadUrl} numberOfLines={1}>{exportInfo.url}</Text>
            <Text style={styles.expiryText}>Expires on: {new Date(exportInfo.expiresAt).toLocaleDateString()}</Text>
          </View>
        ) : (
          <Button
            title="Request Data Archive"
            onPress={handleRequestExport}
            loading={loading}
            style={styles.requestBtn}
          />
        )}
      </Card>
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
    gap: 16,
  },
  card: {
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.primary,
  },
  desc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  formatHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.text,
    marginTop: 6,
  },
  bulletPoint: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  requestBtn: {
    marginTop: 12,
  },
  downloadBox: {
    backgroundColor: colors.light.surfaceElevated,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.primary,
    marginTop: 12,
    gap: 6,
  },
  downloadTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.light.primary,
  },
  downloadUrl: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: colors.light.text,
  },
  expiryText: {
    fontSize: 11,
    color: colors.light.textSecondary,
  },
});
