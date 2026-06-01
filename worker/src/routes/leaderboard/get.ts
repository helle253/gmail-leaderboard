import { asc, desc, sql } from 'drizzle-orm';
import type { Request, Response } from 'express';

import { db } from '../../db/client';
import { inboundEmails } from '../../db/schema';

export async function get(_req: Request, res: Response): Promise<void> {
  const senderExpr = sql<string>`coalesce(nullif(trim(${inboundEmails.sender}), ''), '(unknown sender)')`;
  const emailCountExpr = sql<number>`count(*)`;
  const unsubscribeLinksExpr = sql<string | null>`group_concat(distinct nullif(trim(${inboundEmails.unsubscribeLink}), ''))`;

  const rows = await db
    .select({
      sender: senderExpr,
      emailCount: emailCountExpr,
      unsubscribeLinksCsv: unsubscribeLinksExpr,
    })
    .from(inboundEmails)
    .groupBy(senderExpr)
    .orderBy(desc(emailCountExpr), asc(senderExpr));

  res.json({
    rows: rows.map((row) => ({
      sender: row.sender,
      emailCount: row.emailCount,
      unsubscribeLinks: row.unsubscribeLinksCsv ? row.unsubscribeLinksCsv.split(',') : [],
    })),
  });
}
