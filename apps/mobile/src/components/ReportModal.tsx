import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { theme } from '../theme/colors';
import { Button } from './Button';
import { Input } from './Input';
import { ReportReason } from '@sanad/types';

interface ReportModalProps {
  visible: boolean;
  targetType: 'post' | 'comment' | 'user' | 'live';
  targetId: string;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details?: string) => Promise<void>;
}

const REASONS: Array<{ key: ReportReason; label: string; description: string }> = [
  {
    key: 'misinformation',
    label: 'Misleading Religious Guidance',
    description: 'Inaccurate quotation, fabricated texts, or unverified claims.',
  },
  {
    key: 'sectarian_conflict',
    label: 'Sectarian Conflict or Takfir',
    description: 'Divisive hostility, incitement, or sectarian insults.',
  },
  {
    key: 'impersonation',
    label: 'Impersonation of Scholar',
    description: 'Pretending to be a qualified scholar without verification.',
  },
  {
    key: 'hate_speech',
    label: 'Hate Speech or Harassment',
    description: 'Targeted abuse, derogatory language, or threats.',
  },
  {
    key: 'other',
    label: 'Other Policy Violation',
    description: 'Any other breach of platform safety standards.',
  },
];

export const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  targetType,
  onClose,
  onSubmit,
}) => {
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!selectedReason) return;
    setLoading(true);
    try {
      await onSubmit(selectedReason, details);
      onClose();
      setSelectedReason(null);
      setDetails('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Report {targetType}</Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            <Text style={styles.subtext}>
              Sanad maintains strict standards for religious credibility and community safety.
              Please select the primary reason for this report:
            </Text>

            {REASONS.map((item) => {
              const isSelected = selectedReason === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.reasonOption, isSelected ? styles.reasonOptionActive : null]}
                  onPress={() => setSelectedReason(item.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.reasonLabel, isSelected ? styles.reasonLabelActive : null]}>
                    {item.label}
                  </Text>
                  <Text style={styles.reasonDesc}>{item.description}</Text>
                </TouchableOpacity>
              );
            })}

            <Input
              label="Additional context (optional)"
              placeholder="Provide specific timestamps or context..."
              value={details}
              onChangeText={setDetails}
              multiline
              numberOfLines={3}
              style={styles.detailInput}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Submit Confidential Report"
              variant="danger"
              onPress={handleSend}
              disabled={!selectedReason}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: theme.spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  closeText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondaryLight,
  },
  scroll: {
    marginBottom: theme.spacing.md,
  },
  subtext: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondaryLight,
    marginBottom: theme.spacing.base,
  },
  reasonOption: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.input,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    marginBottom: theme.spacing.sm,
    backgroundColor: '#FAF8F3',
  },
  reasonOptionActive: {
    borderColor: theme.colors.semantic.error,
    backgroundColor: '#FDF2F2',
  },
  reasonLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  reasonLabelActive: {
    color: theme.colors.semantic.error,
  },
  reasonDesc: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  detailInput: {
    minHeight: 80,
  },
  footer: {
    paddingTop: theme.spacing.sm,
  },
});

