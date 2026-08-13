import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedSender, isBlockedSender, normalizeSender } from './sender-policy';

const SMAFEL = 'smafel@santanadeparnaiba.sp.gov.br';
const SECOM = 'secom.imprensa@santanadeparnaiba.sp.gov.br';

test('extrai o endereço do formato "Nome <addr>"', () => {
  assert.equal(normalizeSender(`SMAFEL <${SMAFEL}>`), SMAFEL);
  assert.equal(normalizeSender(`  ${SMAFEL.toUpperCase()} `), SMAFEL);
});

test('SMAFEL é bloqueado mesmo dentro da allowlist do domínio', () => {
  process.env.SECOM_ALLOWLIST = 'santanadeparnaiba.sp.gov.br';
  assert.equal(isAllowedSender(SMAFEL), true, 'a allowlist do domínio deixa passar');
  assert.equal(isBlockedSender(SMAFEL), true, 'a blocklist é quem barra');
  assert.equal(isBlockedSender(`SMAFEL <${SMAFEL}>`), true);
});

test('SECOM continua publicando', () => {
  process.env.SECOM_ALLOWLIST = 'santanadeparnaiba.sp.gov.br';
  assert.equal(isBlockedSender(SECOM), false);
  assert.equal(isAllowedSender(SECOM), true);
});

test('SECOM_BLOCKLIST acrescenta endereço e domínio', () => {
  process.env.SECOM_BLOCKLIST = 'ouvidoria@santanadeparnaiba.sp.gov.br, exemplo.com';
  assert.equal(isBlockedSender('ouvidoria@santanadeparnaiba.sp.gov.br'), true);
  assert.equal(isBlockedSender('qualquer@exemplo.com'), true, 'entrada sem @ bloqueia o domínio');
  assert.equal(isBlockedSender('naoexemplo.com@outro.com'), false, 'domínio não casa por substring');
  assert.equal(isBlockedSender(SECOM), false);
  delete process.env.SECOM_BLOCKLIST;
});
