import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity } from 'react-native';

interface AuthButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  testID?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  testID,
}) => {
  const isActionDisabled = disabled || loading;

  const handlePress = () => {
    if (isActionDisabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore if haptics is unsupported on environment
    }
    onPress();
  };

  if (variant === 'secondary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={isActionDisabled}
        activeOpacity={0.8}
        className={`auth-secondary-button items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 py-3.5 ${
          isActionDisabled ? 'opacity-50' : 'opacity-100'
        }`}
        testID={testID}
      >
        {loading ? (
          <ActivityIndicator color="#ea7a53" size="small" />
        ) : (
          <Text className="auth-secondary-button-text font-sans-semibold text-sm text-accent">
            {title}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isActionDisabled}
      activeOpacity={0.85}
      className={`auth-button items-center justify-center rounded-2xl bg-accent py-4 shadow-sm ${
        isActionDisabled ? 'auth-button-disabled bg-accent/45' : 'bg-accent'
      }`}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" size="small" />
      ) : (
        <Text className="font-sans-bold text-base text-white">
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;
