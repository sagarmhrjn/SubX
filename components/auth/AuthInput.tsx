import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardTypeOptions,
  ReturnKeyTypeOptions,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: any;
  textContentType?: any;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
  editable?: boolean;
  maxLength?: number;
  testID?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
  textContentType,
  returnKeyType = 'done',
  onSubmitEditing,
  editable = true,
  maxLength,
  testID,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(error);

  return (
    <View className="auth-field gap-1.5">
      <Text className="auth-label font-sans-semibold text-sm text-primary">
        {label}
      </Text>
      <View
        className={`relative h-14 flex-row items-center rounded-2xl border bg-background px-4 ${
          hasError
            ? 'border-destructive'
            : isFocused
            ? 'border-accent'
            : 'border-border'
        }`}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(8, 17, 38, 0.35)"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete}
          textContentType={textContentType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 font-sans-medium text-base text-primary"
          style={{
            height: '100%',
            paddingVertical: 0,
            textAlignVertical: 'center',
          }}
          testID={testID}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            className="ml-2 py-2"
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isFocused ? '#ea7a53' : 'rgba(8, 17, 38, 0.45)'}
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && (
        <Text className="auth-error font-sans-medium text-xs text-destructive">
          {error}
        </Text>
      )}
    </View>
  );
};

export default AuthInput;
