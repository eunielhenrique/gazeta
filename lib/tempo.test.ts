import test from 'node:test';
import assert from 'node:assert/strict';
import { dataSP, descreveTempo, formataTemp, horaSP } from './tempo';

// 13/08/2026 12:21 UTC = 09:21 em São Paulo (UTC-3).
const INSTANTE = new Date('2026-08-13T12:21:00Z');

test('hora sai no fuso de São Paulo, não em UTC', () => {
  assert.equal(horaSP(INSTANTE), '09:21');
});

test('hora não depende do fuso da máquina', () => {
  const tz = process.env.TZ;
  process.env.TZ = 'Asia/Tokyo'; // visitante do outro lado do mundo
  assert.equal(horaSP(INSTANTE), '09:21');
  process.env.TZ = tz;
});

test('data por extenso em português', () => {
  assert.equal(dataSP(INSTANTE), 'quinta-feira, 13 de agosto');
});

test('código WMO vira condição em português', () => {
  assert.equal(descreveTempo(0), 'Céu limpo');
  assert.equal(descreveTempo(61), 'Chuva fraca');
  assert.equal(descreveTempo(95), 'Trovoada');
  assert.equal(descreveTempo(7777), 'Tempo instável', 'código desconhecido tem fallback');
  assert.equal(descreveTempo(null), '—', 'sem dado nunca vira número inventado');
});

test('temperatura arredonda e trata ausência', () => {
  assert.equal(formataTemp(23.4), '23°');
  assert.equal(formataTemp(-0.2), '0°', 'zero negativo não vira "-0°"');
  assert.equal(formataTemp(-3.6), '-4°');
  assert.equal(formataTemp(null), '—');
  assert.equal(formataTemp(NaN), '—');
});
