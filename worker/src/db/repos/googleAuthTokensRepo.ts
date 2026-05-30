import { desc, eq, sql } from 'drizzle-orm';

import { db } from '../client';
import { googleAuthTokens } from '../schema';

export type UpsertGoogleTokenInput = {
  googleSub: string;
  email?: string;
  name?: string;
  picture?: string;
  accessToken?: string;
  refreshToken?: string;
  scope?: string;
  tokenType?: string;
  expiryDate?: number;
  idToken?: string;
};

export async function upsertGoogleAuthToken(input: UpsertGoogleTokenInput): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await db
    .insert(googleAuthTokens)
    .values({
      googleSub: input.googleSub,
      email: input.email,
      name: input.name,
      picture: input.picture,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      scope: input.scope,
      tokenType: input.tokenType,
      expiryDate: input.expiryDate,
      idToken: input.idToken,
      lastLoginAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: googleAuthTokens.googleSub,
      set: {
        email: input.email,
        name: input.name,
        picture: input.picture,
        accessToken: input.accessToken,
        refreshToken: sql`coalesce(excluded.refresh_token, ${googleAuthTokens.refreshToken})`,
        scope: input.scope,
        tokenType: input.tokenType,
        expiryDate: input.expiryDate,
        idToken: input.idToken,
        lastLoginAt: now,
        updatedAt: now,
      },
    });
}

export async function getLatestGoogleAuthToken(): Promise<typeof googleAuthTokens.$inferSelect | null> {
  const rows = await db.select().from(googleAuthTokens).orderBy(desc(googleAuthTokens.lastLoginAt)).limit(1);
  return rows[0] ?? null;
}

export async function updateGoogleAuthAccessToken(input: {
  googleSub: string;
  accessToken: string;
  expiryDate: number | null;
  scope: string | null;
  tokenType: string | null;
  idToken: string | null;
}): Promise<void> {
  const now = Math.floor(Date.now() / 1000);

  await db
    .update(googleAuthTokens)
    .set({
      accessToken: input.accessToken,
      expiryDate: input.expiryDate,
      scope: input.scope,
      tokenType: input.tokenType,
      idToken: input.idToken,
      updatedAt: now,
    })
    .where(eq(googleAuthTokens.googleSub, input.googleSub));
}
