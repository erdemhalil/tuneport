import { type DefaultSession, type NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { env } from "~/env";

interface SpotifyProfile {
  id: string;
  display_name?: string;
  images?: Array<{ url: string }>;
  email?: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  token_type?: string;
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
    } & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    error?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
    providerAccountId?: string;
    error?: string;
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
      clientId: env.SPOTIFY_CLIENT_ID,
      clientSecret: env.SPOTIFY_CLIENT_SECRET,
      authorization: {
        url: "https://accounts.spotify.com/authorize",
        params: {
          scope:
            "user-library-read playlist-read-private user-read-email user-read-private",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        accessToken:
          typeof token.accessToken === "string" ? token.accessToken : undefined,
        refreshToken:
          typeof token.refreshToken === "string"
            ? token.refreshToken
            : undefined,
        expiresAt:
          typeof token.expiresAt === "number" ? token.expiresAt : undefined,
        error: typeof token.error === "string" ? token.error : undefined,
        user: {
          ...session.user,
          id: token.sub ?? "",
          spotifyId:
            typeof token.providerAccountId === "string"
              ? token.providerAccountId
              : undefined,
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

      const expiresAt =
        typeof token.expiresAt === "number" ? token.expiresAt : undefined;
      if (expiresAt && Date.now() >= expiresAt) {
        const refreshToken =
          typeof token.refreshToken === "string"
            ? token.refreshToken
            : undefined;
        if (!refreshToken) {
          token.error = "RefreshTokenError";
          return token;
        }
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
                refresh_token: refreshToken,
                client_id: env.SPOTIFY_CLIENT_ID,
                client_secret: env.SPOTIFY_CLIENT_SECRET,
              }),
            },
          );

          if (response.ok) {
            const data = (await response.json()) as TokenResponse;
            token.accessToken = data.access_token;
            token.expiresAt = Date.now() + data.expires_in * 1000;
          } else {
            console.error(
              "Token refresh returned non-OK status:",
              response.status,
            );
            token.error = "RefreshTokenError";
          }
        } catch (error) {
          console.error("Token refresh failed:", error);
          token.error = "RefreshTokenError";
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
