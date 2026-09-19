import { AuthButton } from '@/components/auth/AuthButton';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthInput } from '@/components/auth/AuthInput';
import { ForgotPasswordModal } from '@/components/auth/ForgotPasswordModal';
import { getAuthErrorMessage } from '@/lib/auth-errors';
import { validateEmail, validatePassword } from '@/lib/auth-validation';
import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { styled } from 'nativewind';
import { useState } from 'react';
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

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, fetchStatus } = useSignIn();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

  const handleSignIn = async () => {
    setGeneralError(null);
    const errors: { [key: string]: string } = {};

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
      // Authenticate with Clerk custom flow
      const result = await signIn.password({
        identifier: email.trim(),
        password: password,
      });

      if (result?.error) {
        setGeneralError(getAuthErrorMessage(result.error));
        setIsSubmitting(false);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize();
        router.replace('/(tabs)');
      } else {
        // Fallback or secondary factor if needed
        setGeneralError('Additional verification required for your account.');
      }
    } catch (err) {
      setGeneralError(getAuthErrorMessage(err, 'Sign in failed. Please check your credentials.'));
    } finally {
      setIsSubmitting(false);
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
            title="Welcome back"
            subtitle="Sign in to continue managing your subscriptions"
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

            <View className="gap-4">
              {/* Email Field */}
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
                testID="sign-in-email-input"
              />

              {/* Password Field */}
              <View>
                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
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
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleSignIn}
                  error={fieldErrors.password}
                  testID="sign-in-password-input"
                />

                {/* Forgot Password Link */}
                <View className="mt-1.5 flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => setForgotPasswordVisible(true)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text className="font-sans-medium text-xs text-accent">
                      Forgot password?
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit Button */}
              <View className="mt-2">
                <AuthButton
                  title="Sign in"
                  onPress={handleSignIn}
                  loading={isLoading}
                  disabled={!email || !password}
                  testID="sign-in-submit-button"
                />
              </View>

              {/* Trust Badge */}
              <View className="mt-2 flex-row items-center justify-center gap-1.5">
                <Text className="font-sans-medium text-xs text-muted-foreground">
                  🔒 Bank-grade 256-bit encryption • Private & secure
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Link to Sign Up */}
          <View className="auth-link-row mt-6 flex-row items-center justify-center gap-1">
            <Text className="auth-link-copy font-sans-medium text-sm text-muted-foreground">
              New to SubX?
            </Text>
            <Link href="/(auth)/sign-up" asChild>
              <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text className="auth-link font-sans-bold text-sm text-accent">
                  Create an account
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        visible={forgotPasswordVisible}
        onClose={() => setForgotPasswordVisible(false)}
        defaultEmail={email}
      />
    </SafeAreaView>
  );
}