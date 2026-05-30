import http from 'node:http';
import type { AddressInfo } from 'node:net';

import { shell } from 'electron';
import { CodeChallengeMethod } from 'google-auth-library';
import { google } from 'googleapis';

export type AuthSession = {
  authenticated: boolean;
  email?: string;
  name?: string;
  picture?: string;
};

export async function beginGoogleAuth(): Promise<AuthSession> {
  const clientId = process.env.GOOGLE_CLIENT_ID ?? '';
  if (!clientId) throw new Error('Missing GOOGLE_CLIENT_ID');

  const server = http.createServer();
  let loopbackPort = 0;
  let codeVerifier = '';

  const authCode = await new Promise<string>((resolve, reject) => {
    server.on('request', (req, res) => {
      try {
        const url = new URL(req.url ?? '/', 'http://127.0.0.1');
        const code = url.searchParams.get('code');

        if (!code) {
          res.statusCode = 400;
          res.end('Missing code');
          reject(new Error('Missing OAuth code'));
          return;
        }

        res.statusCode = 200;
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end('<h1>Authentication complete</h1><p>You can return to the app.</p>');
        resolve(code);
      } catch (error) {
        reject(error);
      }
    });

    server.listen(0, '127.0.0.1', async () => {
      try {
        loopbackPort = (server.address() as AddressInfo).port;
        const redirectUri = `http://127.0.0.1:${loopbackPort}/oauth/callback`;
        const oauth2Client = new google.auth.OAuth2({ clientId, redirectUri });

        const pkce = await oauth2Client.generateCodeVerifierAsync();
        codeVerifier = pkce.codeVerifier;

        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          include_granted_scopes: true,
          scope: ['openid', 'email', 'profile', 'https://mail.google.com/'],
          code_challenge: pkce.codeChallenge,
          code_challenge_method: CodeChallengeMethod.S256,
          prompt: 'consent',
        });

        await shell.openExternal(authUrl);
      } catch (error) {
        reject(error);
      }
    });

    server.on('error', reject);
  }).finally(() => {
    server.close();
  });

  if (!loopbackPort) throw new Error('Failed to resolve local callback port');

  const redirectUri = `http://127.0.0.1:${loopbackPort}/oauth/callback`;
  const oauth2Client = new google.auth.OAuth2({ clientId, redirectUri });

  const { tokens } = await oauth2Client.getToken({
    code: authCode,
    codeVerifier,
    redirect_uri: redirectUri,
  });

  if (!tokens.id_token) throw new Error('Missing id_token');

  const verification = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });

  const profile = verification.getPayload();
  if (!profile?.sub) throw new Error('Invalid id_token payload');

  const workerUrl = process.env.WORKER_URL ?? 'http://localhost:8787';
  const workerSetupSecret = process.env.WORKER_SETUP_SECRET ?? '';

  if (workerSetupSecret) {
    const response = await fetch(`${workerUrl}/api/auth/google/session`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-worker-setup-secret': workerSetupSecret,
      },
      body: JSON.stringify({
        sub: profile.sub,
        email: profile.email ?? undefined,
        name: profile.name ?? undefined,
        picture: profile.picture ?? undefined,
        accessToken: tokens.access_token ?? undefined,
        refreshToken: tokens.refresh_token ?? undefined,
        scope: tokens.scope ?? undefined,
        tokenType: tokens.token_type ?? undefined,
        expiryDate: tokens.expiry_date ?? undefined,
        idToken: tokens.id_token ?? undefined,
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`Worker rejected auth session: ${response.status} ${message}`);
    }
  }

  return {
    authenticated: true,
    email: profile.email ?? undefined,
    name: profile.name ?? undefined,
    picture: profile.picture ?? undefined,
  };
}
