import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { theme } from '../theme/colors';
import { VerifiedBadge } from './VerifiedBadge';
import { Button } from './Button';

interface ScholarCardProps {
  id: string;
  displayName: string;
  avatarUrl?: string;
  institution?: string;
  specialties?: string[];
  isFollowing?: boolean;
  onFollowPress?: () => void;
  onPress?: () => void;
  onRequestChatPress?: () => void;
}

export const ScholarCard: React.FC<ScholarCardProps> = ({
  displayName,
  avatarUrl,
  institution,
  specialties = [],
  isFollowing = false,
  onFollowPress,
  onPress,
  onRequestChatPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
      accessibilityRole="button"
    >
      <View style={styles.headerRow}>
        <View style={styles.avatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName}
            </Text>
            <View style={styles.badgeWrap}>
              <VerifiedBadge size="sm" />
            </View>
          </View>
          {institution ? (
            <Text style={styles.institution} numberOfLines={1}>
              {institution}
            </Text>
          ) : null}
        </View>

        {onFollowPress && (
          <Button
            title={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'outline' : 'primary'}
            size="sm"
            pill
            onPress={onFollowPress}
          />
        )}
      </View>

      {specialties.length > 0 && (
        <View style={styles.specialtiesRow}>
          {specialties.slice(0, 3).map((spec, index) => (
            <View key={index} style={styles.specialtyPill}>
              <Text style={styles.specialtyText}>{spec}</Text>
            </View>
          ))}
        </View>
      )}

      {onRequestChatPress && (
        <View style={styles.actionRow}>
          <Button
            title="Request 1:1 Consultation"
            variant="accent"
            size="sm"
            onPress={onRequestChatPress}
            style={styles.chatButton}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface.light,
    borderRadius: theme.radius.card,
    padding: theme.spacing.base,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: theme.colors.brand.emeraldDark,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.brand.emerald,
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: 'bold',
  },
  infoCol: {
    flex: 1,
    marginLeft: theme.spacing.md,
    marginRight: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.colors.text.primaryLight,
  },
  badgeWrap: {
    marginLeft: theme.spacing.xs,
  },
  institution: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondaryLight,
    marginTop: 2,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md,
  },
  specialtyPill: {
    backgroundColor: '#EAE6DC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    marginRight: theme.spacing.xs,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primaryLight,
    fontWeight: '500',
  },
  actionRow: {
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
    paddingTop: theme.spacing.sm,
  },
  chatButton: {
    width: '100%',
  },
});

