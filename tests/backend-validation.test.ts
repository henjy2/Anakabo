import assert from 'node:assert/strict';
import test from 'node:test';
import {
  cleanPreferences,
  cleanRoute,
} from '../supabase/functions/server/validation.ts';

test('cleanPreferences accepts known values and removes unknown keys', () => {
  assert.deepEqual(
    cleanPreferences({
      homeAddress: 'Pòtoprens',
      avoidTolls: true,
      preferredModes: ['car', 'bike'],
      role: 'admin',
    }),
    {
      homeAddress: 'Pòtoprens',
      avoidTolls: true,
      preferredModes: ['car', 'bike'],
    },
  );
});

test('cleanPreferences rejects malformed values', () => {
  assert.equal(cleanPreferences({ avoidTolls: 'yes' }), null);
  assert.equal(cleanPreferences({ theme: 'midnight' }), null);
  assert.equal(cleanPreferences({ preferredModes: ['teleportation'] }), null);
});

test('cleanRoute normalizes a valid route', () => {
  assert.deepEqual(
    cleanRoute({
      origin: '  Dakar ',
      destination: 'Thiès  ',
      mode: 'car',
      duration: 58,
      distance: 71.2,
      sessionId: 'must-not-be-stored',
    }),
    {
      origin: 'Dakar',
      destination: 'Thiès',
      mode: 'car',
      duration: 58,
      distance: 71.2,
    },
  );
});

test('cleanRoute rejects invalid and non-finite route values', () => {
  assert.equal(cleanRoute({ origin: '', destination: 'B', mode: 'car' }), null);
  assert.equal(cleanRoute({ origin: 'A', destination: 'B', mode: 'warp' }), null);
  assert.equal(cleanRoute({ origin: 'A', destination: 'B', mode: 'car', distance: Number.NaN }), null);
  assert.equal(cleanRoute({ origin: 'A', destination: 'B', mode: 'car', duration: -1 }), null);
});
