import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../src/api';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/theme/colors';
import { AppHeader } from '../../src/components/AppHeader';
import { Avatar } from '../../src/components/Avatar';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';

export default function EditProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, updateUser } = useAuthStore();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [languages, setLanguages] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { data: profileData, isLoading: isProfileLoading } = useQuery<any>({
    queryKey: ['myProfile'],
    queryFn: () => api.users.getMe(),
  });

  useEffect(() => {
    const active = profileData?.user || profileData || authUser;
    if (active) {
      if (active.displayName) setDisplayName(active.displayName);
      if (active.username) setUsername(active.username);
      if (active.bio !== undefined) setBio(active.bio);
      if (active.avatarUrl) setAvatarUrl(active.avatarUrl);
      if (active.scholarProfile?.specialties) {
        setSpecialties(active.scholarProfile.specialties.join(', '));
      }
      if (active.scholarProfile?.languages) {
        setLanguages(active.scholarProfile.languages.join(', '));
      }
    }
  }, [profileData, authUser]);

  const isScholar = Boolean(
    authUser?.roles?.includes('scholar') || authUser?.roles?.includes('admin')
  );

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return api.users.updateProfile(payload as any);
    },
    onSuccess: async (updatedUser: any) => {
      const userObj = updatedUser.user || updatedUser;
      await updateUser({
        displayName: userObj.displayName || displayName.trim(),
        username: userObj.username || username.trim().toLowerCase(),
      });
      await queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      Alert.alert(
        'Profile Updated',
        'Your profile information has been saved successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Failed to update profile';
      Alert.alert('Update Failed', msg);
    },
  });

  const handleSave = () => {
    const errors: Record<string, string> = {};
    const trimmedName = displayName.trim();
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '');

    if (!trimmedName || trimmedName.length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    } else if (trimmedName.length > 50) {
      errors.displayName = 'Display name cannot exceed 50 characters';
    }

    if (cleanUsername) {
      if (!/^[a-z0-9_]{3,30}$/.test(cleanUsername)) {
        errors.username = 'Username must be 3-30 lowercase characters, digits, or underscores';
      }
    }

    if (bio && bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const payload: Record<string, unknown> = {
      displayName: trimmedName,
      bio: bio.trim(),
    };

    if (cleanUsername) {
      payload.username = cleanUsername;
    }

    if (avatarUrl.trim()) {
      payload.avatarUrl = avatarUrl.trim();
    }

    if (isScholar) {
      if (specialties.trim()) {
        payload.specialties = specialties
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (languages.trim()) {
        payload.languages = languages
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean);
      }
    }

    mutation.mutate(payload);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Edit Profile"
        subtitle="Manage Account Details and Public Identity"
        showBack
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Avatar Preview Card */}
          <Card style={styles.avatarCard}>
            <View style={styles.avatarRow}>
              <Avatar name={displayName || 'User'} url={avatarUrl || undefined} size={72} />
              <View style={styles.avatarDetails}>
                <Text style={styles.previewName}>{displayName || 'Display Name'}</Text>
                <Text style={styles.previewUsername}>
                  @{username.trim().toLowerCase().replace(/^@/, '') || 'username'}
                </Text>
                <Text style={styles.avatarHint}>
                  Profile identity visible to all registered members
                </Text>
              </View>
            </View>
          </Card>

          {/* Form Fields Card */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionHeading}>Basic Information</Text>

            <Input
              label="Display Name"
              placeholder="e.g. Mohammed Khizer"
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                if (formErrors.displayName) {
                  setFormErrors((prev) => ({ ...prev, displayName: '' }));
                }
              }}
              error={formErrors.displayName}
              autoCapitalize="words"
            />

            <Input
              label="Username"
              placeholder="e.g. khizer"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (formErrors.username) {
                  setFormErrors((prev) => ({ ...prev, username: '' }));
                }
              }}
              error={formErrors.username}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Input
              label="Avatar Image URL (Optional)"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Input
              label="Bio"
              placeholder="Tell other students and scholars about your background..."
              value={bio}
              onChangeText={(text) => {
                setBio(text);
                if (formErrors.bio) {
                  setFormErrors((prev) => ({ ...prev, bio: '' }));
                }
              }}
              error={formErrors.bio}
              multiline
              numberOfLines={3}
              style={styles.bioInput}
            />
            <Text style={styles.charCount}>{bio.length}/500</Text>

            {isScholar && (
              <>
                <View style={styles.scholarDivider} />
                <Text style={styles.sectionHeading}>Scholar Credentials</Text>

                <Input
                  label="Academic Specialties (Comma separated)"
                  placeholder="e.g. Hadith Sciences, Usul al-Fiqh, Arabic Grammar"
                  value={specialties}
                  onChangeText={setSpecialties}
                />

                <Input
                  label="Teaching Languages (Comma separated)"
                  placeholder="e.g. Arabic, English, Urdu"
                  value={languages}
                  onChangeText={setLanguages}
                />
              </>
            )}

            <Button
              title={mutation.isPending ? 'Saving Changes...' : 'Save Profile'}
              onPress={handleSave}
              loading={mutation.isPending || isProfileLoading}
              disabled={mutation.isPending}
              style={styles.saveButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  avatarCard: {
    padding: 16,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarDetails: {
    flex: 1,
  },
  previewName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 2,
  },
  previewUsername: {
    fontSize: 14,
    color: colors.light.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  avatarHint: {
    fontSize: 12,
    color: colors.light.textMuted,
  },
  formCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  charCount: {
    fontSize: 12,
    color: colors.light.textMuted,
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 14,
  },
  scholarDivider: {
    height: 1,
    backgroundColor: colors.light.border,
    marginVertical: 14,
  },
  saveButton: {
    marginTop: 8,
  },
});
