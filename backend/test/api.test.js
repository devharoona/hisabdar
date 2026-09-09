process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = '0123456789abcdef0123456789abcdef';
process.env.CORS_ORIGIN = 'https://allowed.example';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27099/hisabdar-test';
process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS = '100';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const { app } = require('../server');
const { Customer } = require('../models');
const vercelHandler = require('../../api/[...path]');

function listen(handler) {
  return new Promise((resolve) => {
    const server = http.createServer(handler).listen(0, '127.0.0.1', () => resolve(server));
  });
}

let appServer;
let apiServer;

before(async () => {
  appServer = await listen(app);
  apiServer = await listen(vercelHandler);
});

after(async () => {
  await Promise.all([new Promise((resolve) => appServer.close(resolve)), new Promise((resolve) => apiServer.close(resolve))]);
});

function url(server, path) {
  return `http://127.0.0.1:${server.address().port}${path}`;
}

test('Vercel /api/health reports 503 when the database is disconnected', async () => {
  const response = await fetch(url(apiServer, '/api/health'));
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { status: 'unavailable' });
});

test('rejects requests from origins outside CORS_ORIGIN', async () => {
  const response = await fetch(url(appServer, '/health'), { headers: { Origin: 'https://blocked.example' } });
  assert.equal(response.status, 403);
});

test('enforces the 12-character password policy before database work', async () => {
  const response = await fetch(url(appServer, '/api/auth/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ businessName: 'Shop', email: 'owner@example.com', password: 'short' })
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /12 to 128/);
});

test('requires a bearer token for accounting data', async () => {
  const response = await fetch(url(appServer, '/api/customers'));
  assert.equal(response.status, 401);
});

test('scopes customer reads to the authenticated owner', async () => {
  const originalFind = Customer.find;
  let receivedFilter;
  Customer.find = (filter) => {
    receivedFilter = filter;
    return { sort: async () => [] };
  };

  try {
    const token = jwt.sign({ userId: '507f1f77bcf86cd799439011' }, process.env.JWT_SECRET, { issuer: 'hisabdar', audience: 'hisabdar-web' });
    const response = await fetch(url(appServer, '/api/customers'), { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 200);
    assert.deepEqual(receivedFilter, { userId: '507f1f77bcf86cd799439011' });
  } finally {
    Customer.find = originalFind;
  }
});
