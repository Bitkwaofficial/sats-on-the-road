const { test } = require('node:test');
const assert = require('node:assert/strict');
const { zones, zoneForState, sendVisitRequest } = require('../nigeria.js');

test('all 36 states and FCT belong to exactly one of six zones', () => {
  const states = zones.flatMap(zone => zone.states);
  assert.equal(zones.length, 6);
  assert.equal(states.length, 37);
  assert.equal(new Set(states).size, 37);
  assert.equal(zoneForState('FCT Abuja').id, 'nc');
  assert.equal(zoneForState('Lagos').id, 'sw');
  assert.equal(zoneForState('Borno').id, 'ne');
  assert.equal(zoneForState('Unknown'), undefined);
});

test('visit requests post form data to the established inbox endpoint', async () => {
  const data = new FormData(); data.set('city', 'Test city');
  let call;
  await sendVisitRequest(data, async (url, options) => { call = {url, options}; return {ok:true}; });
  assert.equal(call.url, 'https://formspree.io/f/xjgqdokd');
  assert.equal(call.options.method, 'POST');
  assert.equal(call.options.body.get('city'), 'Test city');
  assert.equal(call.options.headers.Accept, 'application/json');
});

test('rejected and offline requests never report success', async () => {
  await assert.rejects(sendVisitRequest(new FormData(), async () => ({ok:false})), /not accepted/);
  await assert.rejects(sendVisitRequest(new FormData(), async () => { throw new Error('offline'); }), /offline/);
});

test('deployment policy allows the existing form service and nested page resources exist', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const root = path.join(__dirname, '..');
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  const policy = config.headers[0].headers.find(h => h.key === 'Content-Security-Policy').value;
  assert(policy.split(';').find(rule => rule.trim().startsWith('connect-src')).split(' ').includes('https://formspree.io'));
  const page = fs.readFileSync(path.join(root, 'countries/nigeria.html'), 'utf8');
  assert.equal((page.match(/data-zone=/g) || []).length, 6);
  assert.equal((page.match(/<h1>/g) || []).length, 1);
  assert(!page.includes('{{') && !page.includes('<!--STATE_OPTIONS-->') && !page.includes('<!--ZONE_BUTTONS-->'));
  for (const match of page.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const value = match[1];
    if (value.startsWith('http') || value.startsWith('mailto:') || value.startsWith('/_vercel/')) continue;
    if (value.startsWith('#')) { assert(page.includes(`id="${value.slice(1)}"`), value); continue; }
    assert(value.startsWith('/'), `Relative resource: ${value}`);
    const local = value.split(/[?#]/)[0].slice(1) || 'index.html';
    assert(fs.existsSync(path.join(root, local)) || fs.existsSync(path.join(root, local + '.html')), local);
  }
});
