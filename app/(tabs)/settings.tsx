import images from '@/constants/images';
import { posthog } from '@/lib/posthog';
import { useClerk, useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { styled } from 'nativewind';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView as RNSafeAreaView } from 'react-native-safe-area-context';

const SafeAreaView = styled(RNSafeAreaView);

export default function Settings() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of SubX?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            } catch {
              // Ignore
            }
            posthog?.capture('sign_out_requested');
            await signOut();
          },
        },
      ]
    );
  };

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split('@')[0] ||
    'Subscriber';

  const displayEmail =
    user?.primaryEmailAddress?.emailAddress || 'No email registered';

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#fff9e3' }}
      className="flex-1 bg-background"
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 pb-32"
      >
        {/* Page Title */}
        <Text className="mb-6 font-sans-extrabold text-3xl text-primary">
          Settings
        </Text>

        {/* User Profile Card */}
        <View className="mb-6 flex-row items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <Image
            source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
            className="size-16 rounded-full border border-border"
          />
          <View className="flex-1">
            <Text className="font-sans-bold text-xl text-primary">
              {displayName}
            </Text>
            <Text className="mt-0.5 font-sans-medium text-sm text-muted-foreground">
              {displayEmail}
            </Text>
            <View className="mt-2 self-start rounded-full bg-success/15 px-2.5 py-0.5">
              <Text className="font-sans-semibold text-xs text-success">
                Verified Account
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <Text className="mb-3 font-sans-bold text-lg text-primary">
          Preferences
        </Text>
        <View className="mb-6 overflow-hidden rounded-3xl border border-border bg-card">
          <View className="flex-row items-center justify-between border-b border-border/60 p-4">
            <View className="flex-row items-center gap-3">
              <View className="size-9 items-center justify-center rounded-xl bg-accent/10">
                <Ionicons name="card-outline" size={18} color="#ea7a53" />
              </View>
              <Text className="font-sans-semibold text-base text-primary">
                Default Currency
              </Text>
            </View>
            <Text className="font-sans-semibold text-sm text-muted-foreground">
              USD ($)
            </Text>
          </View>

          <View className="flex-row items-center justify-between border-b border-border/60 p-4">
            <View className="flex-row items-center gap-3">
              <View className="size-9 items-center justify-center rounded-xl bg-accent/10">
                <Ionicons name="notifications-outline" size={18} color="#ea7a53" />
              </View>
              <Text className="font-sans-semibold text-base text-primary">
                Renewal Alerts
              </Text>
            </View>
            <Text className="font-sans-semibold text-sm text-success">
              Enabled
            </Text>
          </View>

          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="size-9 items-center justify-center rounded-xl bg-accent/10">
                <Ionicons name="shield-checkmark-outline" size={18} color="#ea7a53" />
              </View>
              <Text className="font-sans-semibold text-base text-primary">
                Data Security
              </Text>
            </View>
            <Text className="font-sans-semibold text-sm text-muted-foreground">
              Encrypted
            </Text>
          </View>
        </View>

        {/* Account Actions Section */}
        <Text className="mb-3 font-sans-bold text-lg text-primary">
          Account
        </Text>
        <View className="overflow-hidden rounded-3xl border border-border bg-card">
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-between p-4"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-9 items-center justify-center rounded-xl bg-destructive/10">
                <Ionicons name="log-out-outline" size={18} color="#dc2626" />
              </View>
              <Text className="font-sans-bold text-base text-destructive">
                Sign Out
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Version & Brand Tagline */}
        <View className="mt-10 items-center">
          <Text className="font-sans-bold text-sm text-primary">
            SubX SMART BILLING
          </Text>
          <Text className="mt-1 font-sans-medium text-xs text-muted-foreground">
            Version 1.0.0 • Built with Expo & NativeWind
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}