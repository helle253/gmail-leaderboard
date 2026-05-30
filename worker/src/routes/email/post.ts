import type { Request, Response } from 'express';

import { processInboundEmail } from '../../services/processInboundEmail';
import type { InboundEmailPayload } from '../../types';

export async function post(req: Request, res: Response): Promise<void> {
  const ingressSecret = process.env.EMAIL_INGRESS_SECRET;

  if (ingressSecret) {
    const requestSecret = req.header('x-email-ingress-secret');

    if (!requestSecret || requestSecret !== ingressSecret) {
      res.status(403).send('Invalid ingress secret');
      return;
    }
  }

  try {
    const payload = req.body as InboundEmailPayload;
    await processInboundEmail(payload);

    res.status(202).json({ ok: true });
  } catch {
    res.status(400).send('Invalid JSON payload');
  }
}
