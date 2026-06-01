import type { InboundEmailPayload } from '../types';

function normalizeHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value.join(', ');
  return typeof value === 'string' ? value : undefined;
}

function parseListUnsubscribeCandidates(headerValue: string): string[] {
  const bracketed = [...headerValue.matchAll(/<([^>]+)>/g)]
    .map((m) => m[1])
    .filter((value): value is string => Boolean(value))
    .map((value) => value.trim());

  if (bracketed.length > 0) return bracketed;

  return headerValue
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

export function findUnsubscribeLink(payload: InboundEmailPayload): string | null {
  if (payload.unsubscribeLink) return payload.unsubscribeLink;

  const listUnsubscribe =
    normalizeHeaderValue(payload.listUnsubscribe) ??
    normalizeHeaderValue(payload.headers?.['list-unsubscribe']) ??
    normalizeHeaderValue(payload.headers?.['List-Unsubscribe']);

  const listUnsubscribePost =
    normalizeHeaderValue(payload.listUnsubscribePost) ??
    normalizeHeaderValue(payload.headers?.['list-unsubscribe-post']) ??
    normalizeHeaderValue(payload.headers?.['List-Unsubscribe-Post']);

  if (listUnsubscribe) {
    const candidates = parseListUnsubscribeCandidates(listUnsubscribe);
    const httpsCandidate = candidates.find((c) => /^https?:\/\//i.test(c));
    const mailtoCandidate = candidates.find((c) => /^mailto:/i.test(c));
    const hasOneClick = /list-unsubscribe\s*=\s*one-click/i.test(listUnsubscribePost ?? '');

    if (hasOneClick && httpsCandidate) return httpsCandidate;
    if (httpsCandidate) return httpsCandidate;
    if (mailtoCandidate) return mailtoCandidate;
  }

  const messageBody = `${payload.text ?? ''}\n${payload.html ?? ''}`;
  const keywordBodyMatch = messageBody.match(/https?:\/\/[^\s"'<>]*(unsubscribe|optout|opt-out|preferences?)[^\s"'<>]*/i);
  if (keywordBodyMatch?.[0]) return keywordBodyMatch[0];

  const bodyMatch = messageBody.match(/https?:\/\/[^\s"'<>]+/i);
  return bodyMatch?.[0] ?? null;
}
