import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthInput } from '@/components/auth/AuthInput';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import {
  getPasswordStrength,
  validateCode,
  validateEmail,
  validateName,
  validatePassword,
} from '@/lib/auth-validation';
import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp, fetchStatus } = useSignUp();

  const [pendingVerification, setPendingVerification] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resend cooldown timer
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (pendingVerification && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pendingVerification, resendTimer]);

  const passwordStrength = getPasswordStrength(password);

  // Step 1: Submit Registration
  const handleSignUp = async () => {
    setGeneralError(null);
    const errors: { [key: string]: string } = {};

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      errors.name = nameCheck.error || '';
    }

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      errors.email = emailCheck.error || '';
    }

    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      errors.password = passwordCheck.error || '';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      // Split name into first and optional last name
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

      const createRes = await signUp.create({
        emailAddress: email.trim(),
        password: password,
        firstName,
        lastName,
      });

      if (createRes?.error) {
        setGeneralError(getAuthErrorMessage(createRes.error));
        setIsSubmitting(false);
        return;
      }

      // Trigger email verification code
      const sendRes = await signUp.verifications.sendEmailCode();
      if (sendRes?.error) {
        setGeneralError(getAuthErrorMessage(sendRes.error));
        setIsSubmitting(false);
        return;
      }

      setPendingVerification(true);
      setResendTimer(30);
      setCanResend(false);
    } catch (err) {
      setGeneralError(getAuthErrorMessage(err, 'Unable to create account. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify Email OTP Code
  const handleVerifyCode = async () => {
    setGeneralError(null);
    const codeCheck = validateCode(verificationCode);
    if (!codeCheck.isValid) {
      setFieldErrors({ code: codeCheck.error || '' });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const verifyRes = await signUp.verifications.verifyEmailCode({
        code: verificationCode.trim(),
      });

      if (verifyRes?.error) {
        setGeneralError(getAuthErrorMessage(verifyRes.error));
        setIsSubmitting(false);
        return;
      }

      if (signUp.status === 'complete') {
        await signUp.finalize();
        router.replace('/(tabs)');
      } else {
        setGeneralError('Additional verification required to finish setup.');
      }
    } catch (err) {
      setGeneralError(getAuthErrorMessage(err, 'Verification failed. Please check the code and try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend code
  const handleResendCode = async () => {
    if (!canResend) return;
    setGeneralError(null);
    try {
      const sendRes = await signUp.verifications.sendEmailCode();
      if (sendRes?.error) {
        setGeneralError(getAuthErrorMessage(sendRes.error));
      } else {
        setResendTimer(30);
        setCanResend(false);
      }
    } catch (err) {
      setGeneralError(getAuthErrorMessage(err, 'Could not resend code. Please wait a moment.'));
    }
  };

  const isLoading = isSubmitting || fetchStatus === 'fetching';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff9e3' }}
      className="auth-safe-area flex-1 bg-background"
      edges={['top', 'bottom']}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          style={{ flex: 1 }}
          className="auth-scroll flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          contentContainerClassName="px-5 pt-6 pb-12"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Brand Header */}
          <AuthHeader
            title={pendingVerification ? 'Verify your email' : 'Create account'}
            subtitle={
              pendingVerification
                ? `Enter the 6-digit confirmation code sent to\n${email}`
                : 'Start tracking and optimizing your subscriptions today'
            }
          />

          {/* Form Card */}
          <View className="auth-card mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
            {/* General Error Banner */}
            {generalError && (
              <View className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 p-3.5">
                <Text className="font-sans-medium text-xs text-destructive">
                  {generalError}
                </Text>
              </View>
            )}

            {!pendingVerification ? (
              // Step 1: Sign-Up Form
              <View className="gap-4">
                {/* Full Name */}
                <AuthInput
                  label="Full Name"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (fieldErrors.name) {
                      setFieldErrors((prev) => ({ ...prev, name: '' }));
                    }
                    if (generalError) setGeneralError(null);
                  }}
                  autoCapitalize="words"
                  autoComplete="name"
                  textContentType="name"
                  error={fieldErrors.name}
                  testID="sign-up-name-input"
                />

                {/* Email Address */}
                <AuthInput
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }
                    if (generalError) setGeneralError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={fieldErrors.email}
                  testID="sign-up-email-input"
                />

                {/* Password */}
                <View>
                  <AuthInput
                    label="Password"
                    placeholder="Create a secure password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }
                      if (generalError) setGeneralError(null);
                    }}
                    isPassword
                    autoCapitalize="none"
                    autoComplete="new-password"
                    textContentType="newPassword"
                    returnKeyType="go"
                    onSubmitEditing={handleSignUp}
                    error={fieldErrors.password}
                    testID="sign-up-password-input"
                  />

                  {/* Password Strength Feedback */}
                  {password.length > 0 && (
                    <View className="mt-2 flex-row items-center gap-2">
                      <View className="flex-1 flex-row gap-1">
                        {[1, 2, 3].map((stepIndex) => (
                          <View
                            key={stepIndex}
                            style={{
                              backgroundColor:
                                passwordStrength.score >= stepIndex
                                  ? passwordStrength.color
                                  : 'rgba(0,0,0,0.1)',
                            }}
                            className="h-1.5 flex-1 rounded-full"
                          />
                        ))}
                      </View>
                      <Text
                        style={{ color: passwordStrength.color }}
                        className="font-sans-semibold text-xs"
                      >
                        {passwordStrength.label}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Submit Button */}
                <View className="mt-2">
                  <AuthButton
                    title="Create account"
                    onPress={handleSignUp}
                    loading={isLoading}
                    disabled={!name || !email || !password}
                    testID="sign-up-submit-button"
                  />
                </View>

                {/* Terms and Privacy note */}
                <Text className="mt-1 text-center font-sans-medium text-xs text-muted-foreground">
                  By creating an account, you agree to SubX&apos;s{' '}
                  <Text className="font-sans-semibold text-primary">Terms</Text> and{' '}
                  <Text className="font-sans-semibold text-primary">Privacy Policy</Text>.
                </Text>
              </View>
            ) : (
              // Step 2: Verification Form
              <View className="gap-4">
                <AuthInput
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChangeText={(text) => {
                    setVerificationCode(text);
                    if (fieldErrors.code) {
                      setFieldErrors({});
                    }
                    if (generalError) setGeneralError(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                  error={fieldErrors.code}
                  testID="sign-up-code-input"
                />

                <AuthButton
                  title="Verify & continue"
                  onPress={handleVerifyCode}
                  loading={isLoading}
                  disabled={verificationCode.length < 6}
                  testID="sign-up-verify-button"
                />

                {/* Resend code & Change email */}
                <View className="mt-2 flex-row items-center justify-between">
                  <TouchableOpacity
                    onPress={() => {
                      setPendingVerification(false);
                      setGeneralError(null);
                    }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text className="font-sans-semibold text-xs text-muted-foreground">
                      Edit details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={!canResend}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text
                      className={`font-sans-semibold text-xs ${canResend ? 'text-accent' : 'text-muted-foreground/60'
                        }`}
                    >
                      {canResend ? 'Resend code' : `Resend in ${resendTimer}s`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Footer Link to Sign In */}
          {!pendingVerification && (
            <View className="auth-link-row mt-6 flex-row items-center justify-center gap-1">
              <Text className="auth-link-copy font-sans-medium text-sm text-muted-foreground">
                Already have an account?
              </Text>
              <Link href="/(auth)/sign-in" asChild>
                <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text className="auth-link font-sans-bold text-sm text-accent">
                    Sign in
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}