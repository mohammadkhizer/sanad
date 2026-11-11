import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../api';

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment' | 'user' | 'message' | 'live';
  targetId: string;
}

const REPORT_REASONS = [
  'Misrepresentation of religious qualifications or credentials',
  'Sectarian hostility or abusive speech',
  'Harassment or personal attack',
  'Inappropriate or offensive content',
  'Commercial spam or advertising',
  'Other policy violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  targetType,
  targetId,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [customDetails, setCustomDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const reasonText = customDetails.trim()
        ? `${selectedReason}: ${customDetails.trim()}`
        : selectedReason;

      await api.moderation.createReport({
        targetType,
        targetId,
        reason: reasonText,
      });

      Alert.alert(
        'Report Received',
        'Thank you for helping keep Sanad trustworthy. Our moderation panel will review this item within 24 hours.'
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to submit report';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Report Content or User</Text>
          <Text style={styles.sheetSubtitle}>
            Select the reason for reporting this {targetType}. Every report is logged and
            independently triaged.
          </Text>

          <ScrollView style={styles.reasonsList}>
            {REPORT_REASONS.map((reason, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.reasonOption,
                  selectedReason === reason && styles.reasonOptionActive,
                ]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    selectedReason === reason && styles.reasonTextActive,
                  ]}
                >
                  {reason}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Input
            label="Additional Context (Optional)"
            placeholder="Explain relevant facts or cite specific instances..."
            value={customDetails}
            onChangeText={setCustomDetails}
            multiline
            numberOfLines={2}
          />

          <View style={styles.btnRow}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.cancelBtn}
            />
            <Button
              title="Submit Report"
              variant="danger"
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '85%',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.text,
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  reasonsList: {
    maxHeight: 180,
    marginBottom: 16,
  },
  reasonOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 8,
  },
  reasonOptionActive: {
    borderColor: colors.light.primary,
    backgroundColor: colors.light.surfaceElevated,
  },
  reasonText: {
    fontSize: 13,
    color: colors.light.text,
  },
  reasonTextActive: {
    fontWeight: '700',
    color: colors.light.primary,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
  },
  submitBtn: {
    flex: 1,
  },
});

