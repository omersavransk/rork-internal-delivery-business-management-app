import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    console.log('[TRPC] Using RORK API URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  if (process.env.EXPO_PUBLIC_TOOLKIT_URL) {
    console.log('[TRPC] Using Toolkit URL:', process.env.EXPO_PUBLIC_TOOLKIT_URL);
    return process.env.EXPO_PUBLIC_TOOLKIT_URL;
  }

  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL or EXPO_PUBLIC_TOOLKIT_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const token = await AsyncStorage.getItem('auth_token');
        console.log('[TRPC] Request to:', `${getBaseUrl()}/api/trpc`, 'with token:', !!token);
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      fetch(url, options) {
        console.log('[TRPC] Fetching:', url);
        return fetch(url, options).then(res => {
          console.log('[TRPC] Response status:', res.status);
          return res;
        }).catch(err => {
          console.error('[TRPC] Fetch error:', err);
          throw err;
        });
      },
    }),
  ],
});
