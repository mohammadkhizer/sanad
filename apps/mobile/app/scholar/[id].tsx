import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../src/api/client';
import { colors } from '../../src/theme/colors';
import { Avatar } from '../../src/components/Avatar';
import { VerifiedBadge } from '../../src/components/VerifiedBadge';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { ReportModal } from '../../src/components/ReportModal';
import { useAuthStore } from '../../src/store/authStore';

export default function ScholarProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [reportModalVisible, setReportModalVisible] = useState(false);

  const { data, isLoading } = useQuery<{
    user: any;
    counts: { followers: number; following: number };
    isFollowing: boolean;
  }>({
    queryKey: ['scholarProfile', id],
    queryFn: () => apiClient(`/users/${id}`),
  });

  const followMutation = useMutation({
    mutationFn: (currentlyFollowing: boolean) =>
      apiClient(`/users/${id}/follow`, {
        method: currentlyFollowing ? 'DELETE' : 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarProfile', id] });
    },
  });

  const handleRequestChat = async () => {
    if (!isAuthenticated) {
      router.push('/(auth)/login');
      return;
    }

    Alert.prompt
      ? Alert.prompt(
          'Request Q&A Chat',
          'Briefly state the religious question or topic you wish to ask this verified scholar:',
          async (msg) => {
            if (!msg?.trim()) return;
            try {
              await apiClient('/chat/requests', {
                method: 'POST',
                body: JSON.stringify({ scholarId: id, message: msg.trim() }),
              });
              Alert.alert('Request Sent', 'Your chat request has been delivered to the scholar for review.');
            } catch (err: any) {
              Alert.alert('Notice', err.message || 'Unable to send chat request');
            }
          }
        )
      : Alert.alert('Q&A Request', 'Direct question request dispatched to scholar queue.');
  };

  const handleBlockUser = () => {
    Alert.alert(
      'Block Scholar',
      'Are you sure you want to block this user? You will no longer see their content or circles.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            await apiClient(`/users/${id}/block`, { method: 'POST' });
            Alert.alert('Blocked', 'User has been blocked.');
            router.back();
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  const user = data?.user;
  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>Scholar not found or unavailable.</Text>
      </View>
    );
  }

  const isVerified = Boolean(user.scholarProfile?.verified);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Header Card */}
      <Card style={styles.headerCard}>
        <View style={styles.avatarRow}>
          <Avatar name={user.displayName} url={user.avatarUrl} size={72} />
          <View style={styles.titleInfo}>
            <View style={styles.nameBadgeRow}>
              <Text style={styles.name}>{user.displayName}</Text>
              {isVerified && <VerifiedBadge />}
            </View>
            {Boolean(user.scholarProfile?.institution) && (
              <Text style={styles.institution}>{user.scholarProfile.institution}</Text>
            )}
            <View style={styles.countsRow}>
              <Text style={styles.countItem}>
                <Text style={styles.countNum}>{data?.counts?.followers || 0}</Text> Followers
              </Text>
              <Text style={styles.countItem}>
                <Text style={styles.countNum}>{data?.counts?.following || 0}</Text> Following
              </Text>
            </View>
          </View>
        </View>

        {Boolean(user.bio) && <Text style={styles.bioText}>{user.bio}</Text>}

        {/* Action Buttons */}
        <View style={styles.actionsGrid}>
          <Button
            title={data?.isFollowing ? 'Following' : 'Follow Scholar'}
            variant={data?.isFollowing ? 'outline' : 'primary'}
            onPress={() => followMutation.mutate(Boolean(data?.isFollowing))}
            style={styles.actionBtn}
          />
          <Button
            title="Request Q&A"
            variant="accent"
            onPress={handleRequestChat}
            style={styles.actionBtn}
          />
        </View>
      </Card>

      {/* Specialties & Sanad Details */}
      {user.scholarProfile?.specialties?.length > 0 && (
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Areas of Specialization</Text>
          <View style={styles.pillsRow}>
            {user.scholarProfile.specialties.map((spec: string, idx: number) => (
              <View key={idx} style={styles.specPill}>
                <Text style={styles.specText}>{spec}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Trust & Safety options */}
      <View style={styles.safetyRow}>
        <TouchableOpacity style={styles.safetyBtn} onPress={() => setReportModalVisible(true)}>
          <Text style={styles.safetyText}>Report Scholar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.safetyBtn} onPress={handleBlockUser}>
          <Text style={styles.safetyText}>Block</Text>
        </TouchableOpacity>
      </View>

      <ReportModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        targetType="user"
        targetId={id}
      />
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  notFound: {
    fontSize: 15,
    color: colors.light.textSecondary,
  },
  headerCard: {
    padding: 20,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInfo: {
    marginLeft: 16,
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.light.text,
  },
  institution: {
    fontSize: 13,
    color: colors.light.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  countsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  countItem: {
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  countNum: {
    fontWeight: '800',
    color: colors.light.text,
  },
  bioText: {
    fontSize: 14,
    color: colors.light.text,
    lineHeight: 20,
    marginTop: 14,
    backgroundColor: colors.light.surfaceElevated,
    padding: 10,
    borderRadius: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.light.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specPill: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  specText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  safetyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 12,
  },
  safetyBtn: {
    padding: 8,
  },
  safetyText: {
    color: colors.light.textMuted,
    fontSize: 13,
    textDecorationLine: 'underline',
  },
});

