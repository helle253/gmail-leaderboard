import type { Request, Response } from 'express';

import { getLatestGoogleAuthToken } from '../../db/repos/googleAuthTokensRepo';

export async function get(_req: Request, res: Response): Promise<void> {
  const token = await getLatestGoogleAuthToken();

  res.status(200).json({
    authenticated: !!token,
    email: token?.email ?? null,
    lastLoginAt: token?.lastLoginAt ?? null,
  });
}
