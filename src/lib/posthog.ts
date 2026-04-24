import PostHog from 'posthog-react-native';
import Constants from 'expo-constants';

const API_KEY = Constants.expoConfig?.extra?.posthogApiKey as string | undefined;

let client: PostHog | null = null;

export function initPostHog(): PostHog | null {
  if (!API_KEY) return null; // no-op in dev until API key is configured

  client = new PostHog(API_KEY, {
    host: 'https://us.i.posthog.com',
    disabled: __DEV__,
  });

  return client;
}

export function getPostHog(): PostHog | null {
  return client;
}
