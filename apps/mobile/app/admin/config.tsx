import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { colors } from '../../src/theme/colors';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

export default function AdminConfigScreen() {
  const [minStatementLen, setMinStatementLen] = useState('20');
  const [requireEndorsement, setRequireEndorsement] = useState(true);
  const [enforceTwoFactor, setEnforceTwoFactor] = useState(true);
  const [reelMaxSeconds, setReelMaxSeconds] = useState('90');
  const [videoMaxMinutes, setVideoMaxMinutes] = useState('60');
  const [defaultQuietHours, setDefaultQuietHours] = useState(true);

  const handleSave = () => {
    Alert.alert('Configuration Saved', 'System-wide policy and verification parameters have been updated.');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Scholar Verification Criteria</Text>
        <Text style={styles.desc}>
          Set baseline accreditation and gatekeeping rules across applicant queues:
        </Text>

        <Input
          label="Minimum Statement Length (Characters)"
          value={minStatementLen}
          onChangeText={setMinStatementLen}
          keyboardType="number-pad"
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Require Peer Scholar Endorsement</Text>
            <Text style={styles.settingSub}>Requires 1-2 verified scholars to endorse applicant</Text>
          </View>
          <Switch
            value={requireEndorsement}
            onValueChange={setRequireEndorsement}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Mandatory 2FA Before Publishing</Text>
            <Text style={styles.settingSub}>Blocks video/live publishing until 2FA is confirmed</Text>
          </View>
          <Switch
            value={enforceTwoFactor}
            onValueChange={setEnforceTwoFactor}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Content & Media Limits</Text>

        <Input
          label="Maximum Reel Duration (Seconds)"
          value={reelMaxSeconds}
          onChangeText={setReelMaxSeconds}
          keyboardType="number-pad"
        />

        <Input
          label="Maximum Masterclass Video Duration (Minutes)"
          value={videoMaxMinutes}
          onChangeText={setVideoMaxMinutes}
          keyboardType="number-pad"
        />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Global Prayer-Time Policy</Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={styles.settingLabel}>Default Quiet Hours for New Accounts</Text>
            <Text style={styles.settingSub}>Pre-enable prayer quiet hours by default</Text>
          </View>
          <Switch
            value={defaultQuietHours}
            onValueChange={setDefaultQuietHours}
            trackColor={{ false: colors.light.border, true: colors.light.primary }}
          />
        </View>
      </Card>

      <Button title="Save Platform Configuration" onPress={handleSave} style={styles.saveBtn} />
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
    gap: 16,
  },
  card: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.light.primary,
  },
  desc: {
    fontSize: 12,
    color: colors.light.textSecondary,
    lineHeight: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.light.text,
  },
  settingSub: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  saveBtn: {
    marginTop: 8,
  },
});

