export const WORKER_PORT = Number(process.env.WORKER_PORT ?? 8787);
export const WORKER_URL = process.env.WORKER_URL ?? `http://localhost:${WORKER_PORT}`;
export const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? '';
