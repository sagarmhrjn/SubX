import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export interface TokenCache {
  getToken: (key: string) => Promise<string | null>;
  saveToken: (key: string, token: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

/**
 * Robust token cache implementation for Expo Go and standalone builds.
 * Uses SecureStore on native platforms (iOS/Android) and handles fallbacks gracefully.
 */
export const tokenCache: TokenCache | undefined =
  Platform.OS !== 'web'
    ? {
        async getToken(key: string) {
          try {
            return await SecureStore.getItemAsync(key);
          } catch (error) {
            console.warn('[tokenCache] SecureStore getToken error:', error);
            try {
              await SecureStore.deleteItemAsync(key);
            } catch {
              // Ignore
            }
            return null;
          }
        },
        async saveToken(key: string, value: string) {
          try {
            await SecureStore.setItemAsync(key, value);
          } catch (error) {
            console.warn('[tokenCache] SecureStore saveToken error:', error);
          }
        },
        async clearToken(key: string) {
          try {
            await SecureStore.deleteItemAsync(key);
          } catch (error) {
            console.warn('[tokenCache] SecureStore clearToken error:', error);
          }
        },
      }
    : undefined;

export default tokenCache;
