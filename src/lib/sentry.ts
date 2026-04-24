import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const DSN = Constants.expoConfig?.extra?.sentryDsn as string | undefined;

export function initSentry() {
  if (!DSN) return; // no-op in dev until DSN is configured

  Sentry.init({
    dsn: DSN,
    environment: __DEV__ ? 'development' : 'production',
    enabled: !__DEV__,
  });
}
