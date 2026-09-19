import { Ionicons } from '@expo/vector-icons';
import { useSignIn } from '@clerk/expo';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateCode, validateEmail, validatePassword } from '@/lib/auth-validation';
import { AuthButton } from './AuthButton';
import { AuthInput } from './AuthInput';

interface ForgotPasswordModalProps {
  visible: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  visible,
  onClose,
  defaultEmail = '',
}) => {
  const { signIn, fetchStatus } = useSignIn();

  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState(defaultEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setStep('request');
    setCode('');
    setNewPassword('');
    setErrorMessage(null);
    setFieldErrors({});
    onClose();
  };

  const handleRequestCode = async () => {
    setErrorMessage(null);
    setFieldErrors({});

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setFieldErrors({ email: emailCheck.error || '' });
      return;
    }

    try {
      setIsSubmitting(true);
      // Initialize sign-in attempt with identifier
      const initRes = await signIn.create({
        identifier: email.trim(),
      });

      if (initRes?.error) {
        setErrorMessage(getAuthErrorMessage(initRes.error));
        return;
      }

      // Send password reset code
      const res = await signIn.resetPasswordEmailCode.sendCode();

      if (res?.error) {
        setErrorMessage(getAuthErrorMessage(res.error));
      } else {
        setStep('reset');
      }
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, 'Unable to send reset code. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage(null);
    setFieldErrors({});

    const codeCheck = validateCode(code);
    if (!codeCheck.isValid) {
      setFieldErrors((prev) => ({ ...prev, code: codeCheck.error || '' }));
      return;
    }

    const passCheck = validatePassword(newPassword);
    if (!passCheck.isValid) {
      setFieldErrors((prev) => ({ ...prev, newPassword: passCheck.error || '' }));
      return;
    }

    try {
      setIsSubmitting(true);
      // 1. Verify code
      const verifyRes = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });

      if (verifyRes?.error) {
        setErrorMessage(getAuthErrorMessage(verifyRes.error));
        setIsSubmitting(false);
        return;
      }

      // 2. Submit new password
      const submitRes = await signIn.resetPasswordEmailCode.submitPassword({
        password: newPassword,
      });

      if (submitRes?.error) {
        setErrorMessage(getAuthErrorMessage(submitRes.error));
        setIsSubmitting(false);
        return;
      }

      // 3. Finalize session
      await signIn.finalize();
      onClose();
    } catch (err) {
      setErrorMessage(getAuthErrorMessage(err, 'Failed to reset password. Please check the code and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="max-h-[85%] rounded-t-3xl bg-background border-t border-border p-6 shadow-xl">
          {/* Modal Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="font-sans-bold text-2xl text-primary">
                {step === 'request' ? 'Reset Password' : 'Enter New Password'}
              </Text>
              <Text className="mt-1 font-sans-medium text-sm text-muted-foreground">
                {step === 'request'
                  ? "We'll send a 6-digit recovery code to your email."
                  : `Enter the code sent to ${email}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              className="size-8 items-center justify-center rounded-full bg-muted"
              accessibilityLabel="Close reset password modal"
            >
              <Ionicons name="close" size={20} color="#081126" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {/* Error banner */}
            {errorMessage && (
              <View className="mb-4 flex-row items-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                <Ionicons name="alert-circle" size={18} color="#dc2626" />
                <Text className="flex-1 font-sans-medium text-xs text-destructive">
                  {errorMessage}
                </Text>
              </View>
            )}

            {step === 'request' ? (
              <View className="gap-4">
                <AuthInput
                  label="Account Email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (fieldErrors.email) setFieldErrors({});
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={fieldErrors.email}
                />

                <AuthButton
                  title="Send Recovery Code"
                  onPress={handleRequestCode}
                  loading={isSubmitting || fetchStatus === 'fetching'}
                  disabled={!email.trim()}
                />
              </View>
            ) : (
              <View className="gap-4">
                <AuthInput
                  label="6-Digit Recovery Code"
                  placeholder="e.g. 123456"
                  value={code}
                  onChangeText={(text) => {
                    setCode(text);
                    if (fieldErrors.code) setFieldErrors((prev) => ({ ...prev, code: '' }));
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={fieldErrors.code}
                />

                <AuthInput
                  label="New Password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: '' }));
                  }}
                  isPassword
                  error={fieldErrors.newPassword}
                />

                <AuthButton
                  title="Update Password & Sign In"
                  onPress={handleResetPassword}
                  loading={isSubmitting || fetchStatus === 'fetching'}
                  disabled={!code.trim() || !newPassword}
                />

                <TouchableOpacity
                  onPress={() => setStep('request')}
                  className="items-center py-2"
                >
                  <Text className="font-sans-semibold text-xs text-accent">
                    Change email or resend code
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default ForgotPasswordModal;
