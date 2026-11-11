import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors } from '../theme/colors';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, style, ...rest }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, Boolean(error) && styles.inputError, style]}
        placeholderTextColor={colors.light.textMuted}
        {...rest}
      />
      {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.light.surface,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.light.text,
  },
  inputError: {
    borderColor: colors.light.error,
  },
  errorText: {
    color: colors.light.error,
    fontSize: 12,
    marginTop: 4,
  },
});

