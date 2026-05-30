import type { InboundEmailPayload } from '../types';

export function findUnsubscribeLink(payload: InboundEmailPayload): string | null {
  if (payload.unsubscribeLink) return payload.unsubscribeLink;

  const listUnsubscribeHeader = payload.listUnsubscribe ?? payload.headers?.['list-unsubscribe'] ?? payload.headers?.['List-Unsubscribe'];

  const listUnsubscribe = Array.isArray(listUnsubscribeHeader) ? listUnsubscribeHeader.join(', ') : listUnsubscribeHeader;

  if (typeof listUnsubscribe === 'string') {
    const headerMatch = listUnsubscribe.match(/https?:\/\/[^>\s,]+/i);
    if (headerMatch?.[0]) return headerMatch[0];
  }

  const messageBody = `${payload.text ?? ''}\n${payload.html ?? ''}`;
  const bodyMatch = messageBody.match(/https?:\/\/[^\s"'<>]+unsubscribe[^\s"'<>]*/i);

  return bodyMatch?.[0] ?? null;
}
