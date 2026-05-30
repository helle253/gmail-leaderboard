import type { Request, Response } from 'express';

import { upsertGoogleAuthToken } from '../../../db/repos/googleAuthTokensRepo';

export async function post(req: Request, res: Response): Promise<void> {
  const setupSecret = process.env.WORKER_SETUP_SECRET;
  if (!setupSecret) {
    res.status(500).send('Missing WORKER_SETUP_SECRET');
    return;
  }

  const provided = req.header('x-worker-setup-secret');
  if (!provided || provided !== setupSecret) {
    res.status(403).send('Invalid setup secret');
    return;
  }

  const body = req.body as {
    sub?: string;
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

  if (!body?.sub) {
    res.status(400).send('Missing sub');
    return;
  }

  await upsertGoogleAuthToken({
    googleSub: body.sub,
    email: body.email,
    name: body.name,
    picture: body.picture,
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    scope: body.scope,
    tokenType: body.tokenType,
    expiryDate: body.expiryDate,
    idToken: body.idToken,
  });

  res.status(202).json({ ok: true });
}
