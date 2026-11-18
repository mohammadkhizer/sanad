import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { AppHeader } from '../../src/components/AppHeader';
import { Icon } from '../../src/components/Icon';
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
    <View style={styles.screen}>
      <AppHeader
        title="Data Portability"
        subtitle="Export Personal Scholarly Archive"
        showBack
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Text style={styles.title}>Export Your Sanad Archive</Text>
          <Text style={styles.desc}>
            In accordance with digital data ownership standards, you can download a complete archive of your posts, lessons, comments, followers, and consultation transcripts.
          </Text>

          <Text style={styles.formatHeading}>Archive Contents:</Text>
          <Text style={styles.bulletPoint}>• Profile and Institutional Accreditation Metadata (JSON)</Text>
          <Text style={styles.bulletPoint}>• Published Lessons, Videos and Transcripts (JSON + Media Links)</Text>
          <Text style={styles.bulletPoint}>• Consultation Messages and Inquiries (JSON)</Text>
          <Text style={styles.bulletPoint}>• Follower Network and Scholarly Connections (JSON)</Text>

          {exportInfo ? (
            <View style={styles.downloadBox}>
              <View style={styles.downloadHeader}>
                <Icon name="check" size={18} color={colors.light.primary} />
                <Text style={styles.downloadTitle}>Archive Ready for Download</Text>
              </View>
              <Text style={styles.downloadUrl} numberOfLines={1}>{exportInfo.url}</Text>
              <Text style={styles.expiryText}>Expires on {new Date(exportInfo.expiresAt).toLocaleDateString()}</Text>
            </View>
          ) : (
            <Button
              title="Request Data Archive"
              variant="primary"
              onPress={handleRequestExport}
              loading={loading}
              style={styles.requestBtn}
            />
          )}
        </Card>
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
  card: {
    padding: 18,
    borderRadius: 14,
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.light.primary,
  },
  desc: {
    fontSize: 13,
    color: colors.light.textSecondary,
    lineHeight: 19,
  },
  formatHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
    marginTop: 6,
  },
  bulletPoint: {
    fontSize: 12,
    color: colors.light.text,
    lineHeight: 18,
  },
  downloadBox: {
    backgroundColor: colors.light.background,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 6,
    marginTop: 8,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.primary,
  },
  downloadUrl: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: colors.light.textMuted,
  },
  expiryText: {
    fontSize: 11,
    color: colors.light.textSecondary,
  },
  requestBtn: {
    marginTop: 8,
  },
});
