import test from 'node:test';
import assert from 'node:assert/strict';
import { readPreferences, savePreferences } from '../js/storage.js';

test('recupera preferências permitidas e ignora valores desconhecidos', () => {
  assert.deepEqual(readPreferences({ getItem: () => '{"coin":"solana","currency":"usd"}' }), { coin: 'solana', currency: 'usd' });
  assert.deepEqual(readPreferences({ getItem: () => '{"coin":"fake","currency":"xxx"}' }), { coin: 'bitcoin', currency: 'brl' });
});
test('JSON corrompido, armazenamento bloqueado e cota excedida não interrompem a aplicação', () => {
  assert.equal(readPreferences({ getItem: () => '{' }).coin, 'bitcoin');
  assert.equal(readPreferences(undefined).currency, 'brl');
  assert.equal(savePreferences({ setItem: () => { throw new Error('Quota'); } }, {}), false);
});
