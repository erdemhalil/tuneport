import { type DefaultSession, type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

interface SpotifyProfile {
  id: string;
  display_name?: string;
  images?: Array<{ url: string }>;
  email?: string;
}

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // Spotify-specific properties
      spotifyId?: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    providerAccountId?: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-library-read playlist-read-private user-read-email user-read-private",
          response_type: "code",
        },
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        accessToken: token.accessToken as string,
        refreshToken: token.refreshToken as string,
        expiresAt: token.expiresAt as number,
        user: {
          ...session.user,
          id: token.sub!,
          spotifyId: token.providerAccountId as string,
          name: token.name ?? session.user.name,
          image: token.picture ?? session.user.image,
        },
      };
    },
    jwt: async ({ token, account, profile }) => {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = (account.expires_at ?? 0) * 1000; // Convert to milliseconds
        token.providerAccountId = account.providerAccountId;
      }

      // Check if token is expired and refresh if needed
      const expiresAt = token.expiresAt as number | undefined;
      if (expiresAt && Date.now() >= expiresAt) {
        try {
          const response = await fetch(
            "https://accounts.spotify.com/api/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string,
                client_id: process.env.SPOTIFY_CLIENT_ID!,
                client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
              }),
            },
          );

          if (response.ok) {
            const data = await response.json();
            token.accessToken = data.access_token;
            token.expiresAt = Date.now() + data.expires_in * 1000;
            // Spotify refresh tokens can be reused, so we keep the same refresh token
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          // Token refresh failed, user will need to re-authenticate
        }
      }

      if (profile) {
        const spotifyProfile = profile as SpotifyProfile;
        token.name = spotifyProfile.display_name ?? token.name;
        token.picture = spotifyProfile.images?.[0]?.url ?? token.picture;
      }
      return token;
    },
  },
};
