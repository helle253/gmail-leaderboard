import 'dotenv/config';

import cors from 'cors';
import express from 'express';

import { runMigrations } from './db/migrate';
import { startImapLoop } from './imap/start';
import { CLIENT_URL, WORKER_PORT } from './lib/constants';
import { post as postGoogleSession } from './routes/auth/google/session';
import { get as getAuthStatus } from './routes/auth/status';
import { post as postEmail } from './routes/email/post';
import { get as getHealth } from './routes/health/get';

const app = express();

app.use(cors({ origin: [CLIENT_URL], credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/', getHealth);
app.get('/health', getHealth);
app.get('/api/health', getHealth);

app.get('/api/auth/status', getAuthStatus);
app.post('/api/auth/google/session', postGoogleSession);

app.post('/email', postEmail);

runMigrations();

app.listen(WORKER_PORT, () => {
  console.log(`worker listening on http://localhost:${WORKER_PORT}`);
  startImapLoop().catch((error) => {
    console.error('[imap] fatal error:', error);
    process.exit(1);
  });
});
