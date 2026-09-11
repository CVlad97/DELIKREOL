'use strict';
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 3000);
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || '';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || '';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v23.0';
const REQUIRE_SIGNATURE = process.env.REQUIRE_SIGNATURE === 'true';
const DATA_DIR = process.env.DATA_DIR || '/data';
const INBOX_DIR = path.join(DATA_DIR, 'inbox');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const MAX_BODY = 2 * 1024 * 1024;

for (const dir of [INBOX_DIR, MEDIA_DIR]) fs.mkdirSync(dir, { recursive: true });

function safeName(value) { return String(value || 'unknown').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180); }
function json(res, status, body) { const out = JSON.stringify(body); res.writeHead(status, {'content-type':'application/json; charset=utf-8','content-length':Buffer.byteLength(out)}); res.end(out); }
function readBody(req) { return new Promise((resolve, reject) => { let size = 0; const chunks = []; req.on('data', c => { size += c.length; if (size > MAX_BODY) { reject(new Error('payload too large')); req.destroy(); return; } chunks.push(c); }); req.on('end', () => resolve(Buffer.concat(chunks))); req.on('error', reject); }); }
function validSignature(req, raw) { if (!APP_SECRET) return !REQUIRE_SIGNATURE; const header = req.headers['x-hub-signature-256']; if (!header || !header.startsWith('sha256=')) return false; const expected = 'sha256=' + crypto.createHmac('sha256', APP_SECRET).update(raw).digest('hex'); return crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected)); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2) + '
', { mode: 0o640 }); }
function extForMime(mime) { const map = {'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif','video/mp4':'mp4','audio/ogg':'ogg','audio/mpeg':'mp3','application/pdf':'pdf'}; return map[mime] || 'bin'; }

async function fetchMedia(mediaId) {
  if (!ACCESS_TOKEN) throw new Error('WHATSAPP_ACCESS_TOKEN is not configured');
  const metaUrl = new URL(`https://graph.facebook.com/${API_VERSION}/${encodeURIComponent(mediaId)}`);
  if (PHONE_NUMBER_ID) metaUrl.searchParams.set('phone_number_id', PHONE_NUMBER_ID);
  const meta = await fetch(metaUrl, { headers: { authorization: `Bearer ${ACCESS_TOKEN}` } });
  if (!meta.ok) throw new Error(`media metadata HTTP ${meta.status}`);
  const info = await meta.json();
  if (!info.url) throw new Error('media URL missing');
  const file = await fetch(info.url, { headers: { authorization: `Bearer ${ACCESS_TOKEN}` } });
  if (!file.ok) throw new Error(`media download HTTP ${file.status}`);
  const mime = (file.headers.get('content-type') || info.mime_type || 'application/octet-stream').split(';')[0];
  const data = Buffer.from(await file.arrayBuffer());
  if (data.length > 50 * 1024 * 1024) throw new Error('media exceeds 50MB');
  return { data, mime, sha256: crypto.createHash('sha256').update(data).digest('hex') };
}

async function processPayload(payload) {
  const now = new Date();
  for (const entry of payload.entry || []) for (const change of entry.changes || []) {
    const value = change.value || {};
    for (const msg of value.messages || []) {
      const id = safeName(msg.id || crypto.randomUUID());
      const day = now.toISOString().slice(0, 10).replaceAll('-', '/');
      const dir = path.join(INBOX_DIR, day); fs.mkdirSync(dir, { recursive: true });
      const base = path.join(dir, id);
      if (fs.existsSync(base + '.json')) continue;
      const item = { id: msg.id, from: msg.from || null, timestamp: msg.timestamp || null, type: msg.type || null, text: msg.text?.body || null, caption: msg.image?.caption || msg.document?.caption || msg.video?.caption || null, filename: msg.document?.filename || null, media: null, received_at: now.toISOString(), status: 'received' };
      const media = msg.image || msg.document || msg.video || msg.audio || msg.sticker;
      if (media?.id) {
        try { const got = await fetchMedia(media.id); const name = `${id}.${extForMime(got.mime)}`; fs.writeFileSync(path.join(MEDIA_DIR, name), got.data, { mode: 0o640 }); item.media = { id: media.id, file: name, mime: got.mime, bytes: got.data.length, sha256: got.sha256 }; item.status = 'downloaded'; }
        catch (err) { item.status = 'media_error'; item.error = err.message; }
      }
      writeJson(base + '.json', item);
    }
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/health') return json(res, 200, { ok: true, service: 'delikreol-whatsapp' });
  if (req.method === 'GET' && url.pathname === '/webhooks/whatsapp') {
    if (url.searchParams.get('hub.mode') === 'subscribe' && url.searchParams.get('hub.verify_token') === VERIFY_TOKEN && VERIFY_TOKEN) res.writeHead(200, {'content-type':'text/plain; charset=utf-8'}); return res.end(url.searchParams.get('hub.challenge'));
    return json(res, 403, { ok: false });
  }
  if (req.method === 'POST' && url.pathname === '/webhooks/whatsapp') {
    try { const raw = await readBody(req); if (!validSignature(req, raw)) return json(res, 403, { ok: false }); const payload = JSON.parse(raw.toString('utf8')); res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify({ received: true })); processPayload(payload).catch(err => console.error('processing failed:', err.message)); }
    catch (err) { if (!res.headersSent) json(res, 400, { ok: false }); console.error('webhook failed:', err.message); }
    return;
  }
  return json(res, 404, { ok: false });
});
server.listen(PORT, '0.0.0.0', () => console.log(`WhatsApp ingest listening on ${PORT}`));
