import { google } from 'googleapis';

import { getLatestGoogleAuthToken, updateGoogleAuthAccessToken } from '../db/repos/googleAuthTokensRepo';
import { GOOGLE_CLIENT_ID } from '../lib/constants';

function createOAuth2Client(): InstanceType<typeof google.auth.OAuth2> {
  return new google.auth.OAuth2({ clientId: GOOGLE_CLIENT_ID });
}

export async function getValidGoogleAccessToken(): Promise<{ accessToken: string; email?: string; sub: string }> {
  const tokenRow = await getLatestGoogleAuthToken();
  if (!tokenRow) throw new Error('No Google auth session configured');

  const nowMs = Date.now();
  const expiryMs = tokenRow.expiryDate ? tokenRow.expiryDate : 0;
  const isUsable = !!tokenRow.accessToken && expiryMs - nowMs > 60_000;

  if (isUsable) {
    return {
      accessToken: tokenRow.accessToken as string,
      email: tokenRow.email ?? undefined,
      sub: tokenRow.googleSub,
    };
  }

  if (!tokenRow.refreshToken) throw new Error('Missing refresh token; sign in again from client');

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: tokenRow.refreshToken,
  });

  const refreshed = await oauth2Client.refreshAccessToken();
  const credentials = refreshed.credentials;

  if (!credentials.access_token) throw new Error('Failed to refresh access token');

  await updateGoogleAuthAccessToken({
    googleSub: tokenRow.googleSub,
    accessToken: credentials.access_token,
    expiryDate: credentials.expiry_date ?? null,
    scope: credentials.scope ?? tokenRow.scope ?? null,
    tokenType: credentials.token_type ?? tokenRow.tokenType ?? null,
    idToken: credentials.id_token ?? tokenRow.idToken ?? null,
  });

  return {
    accessToken: credentials.access_token,
    email: tokenRow.email ?? undefined,
    sub: tokenRow.googleSub,
  };
}
