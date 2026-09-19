import Constants from 'expo-constants';
import PostHog from 'posthog-react-native';

const extra = Constants.expoConfig?.extra;
const projectToken =
  (extra?.posthogProjectToken as string | undefined) ||
  process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN ||
  process.env.POSTHOG_PROJECT_TOKEN;
const host =
  (extra?.posthogHost as string | undefined) ||
  process.env.EXPO_PUBLIC_POSTHOG_HOST ||
  process.env.POSTHOG_HOST ||
  'https://us.i.posthog.com';

if (__DEV__ && !projectToken) {
  console.warn(
    '[PostHog] POSTHOG_PROJECT_TOKEN is missing or unconfigured. PostHog tracking will be disabled.',
  );
}


export const posthog =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        captureAppLifecycleEvents: true,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
          },
        },
      })
    : undefined;
